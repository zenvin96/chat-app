import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import { UsersRound, Info, UserPlus, LogOut, X } from "lucide-react";
import GroupMembersModal from "./GroupMembersModal";

const GroupChatHeader = ({ group, onAddMembers, onLeaveGroup, onClose }) => {
  const { members } = group;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    onLeaveGroup();
    setShowLeaveConfirm(false);
  };

  return (
    <div className="py-3 px-4 border-b border-base-300 flex items-center justify-between relative">
      <div className="flex items-center gap-3">
        <div className="size-12 bg-base-300 rounded-full flex items-center justify-center overflow-hidden">
          {group.groupPic ? (
            <img
              src={group.groupPic}
              alt={group.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <UsersRound className="size-6 text-zinc-500" />
          )}
        </div>
        <div>
          <h3 className="font-bold">{group.name}</h3>
          <p className="text-sm text-zinc-400">{members.length} 位成员</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={onAddMembers}
          className="btn btn-sm btn-ghost btn-circle"
          title="添加成员"
        >
          <UserPlus className="size-5" />
        </button>
        <button className="btn btn-sm btn-ghost btn-circle" title="群组信息">
          <Info className="size-5" />
        </button>
        <button
          onClick={handleLeaveClick}
          className="btn btn-sm btn-ghost btn-circle text-red-500"
          title="退出群组"
        >
          <LogOut className="size-5" />
        </button>
        <button
          onClick={onClose}
          className="btn btn-sm btn-ghost btn-circle"
          title="关闭聊天"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="absolute z-20 right-0 top-[calc(100%+10px)] bg-base-200 shadow-md rounded-lg p-4 w-64">
          <h4 className="font-bold mb-2">确认退出群组？</h4>
          <p className="text-sm mb-3">您将不再收到此群组的消息通知</p>
          <div className="flex justify-end gap-2">
            <button
              className="btn btn-sm btn-ghost"
              onClick={() => setShowLeaveConfirm(false)}
            >
              取消
            </button>
            <button
              className="btn btn-sm btn-error text-white"
              onClick={confirmLeave}
            >
              退出
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const GroupChatContainer = () => {
  const {
    messages,
    getGroupMessages,
    isMessagesLoading,
    selectedGroup,
    setSelectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    sendGroupMessage,
    users,
    getUsers,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [senderCache, setSenderCache] = useState({});

  // Always load users when component mounts
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Fetch and cache sender data - 修复无限循环问题
  useEffect(() => {
    if (!messages || !users || users.length === 0) return;

    // 创建新的缓存对象
    const newSenderCache = { ...senderCache };
    let cacheUpdated = false;

    messages.forEach((message) => {
      const senderId =
        typeof message.senderId === "object"
          ? message.senderId._id
          : message.senderId;

      // 如果已经缓存过这个发送者，跳过
      if (newSenderCache[senderId]) return;

      // 如果是当前用户
      if (senderId === authUser._id) {
        newSenderCache[senderId] = authUser;
        cacheUpdated = true;
        return;
      }

      // 在用户列表中查找
      const userMatch = users.find((u) => u._id === senderId);
      if (userMatch) {
        newSenderCache[senderId] = userMatch;
        cacheUpdated = true;
        return;
      }

      // 在群组成员中查找
      if (selectedGroup?.members) {
        const memberMatch = selectedGroup.members.find(
          (m) => typeof m === "object" && m._id === senderId
        );
        if (memberMatch) {
          newSenderCache[senderId] = memberMatch;
          cacheUpdated = true;
          return;
        }
      }

      // 默认情况
      newSenderCache[senderId] = {
        _id: senderId,
        fullName:
          typeof senderId === "string"
            ? `User-${senderId.substring(0, 4)}`
            : "Unknown User",
        profilePic: null,
      };
      cacheUpdated = true;
    });

    // 只在有更新时设置state
    if (cacheUpdated) {
      setSenderCache(newSenderCache);
    }
  }, [messages, users, selectedGroup, authUser._id]); // 移除senderCache依赖

  // Get messages when selected group changes
  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
      subscribeToGroupMessages(selectedGroup._id);
    }

    return () => {
      if (selectedGroup?._id) {
        unsubscribeFromGroupMessages(selectedGroup._id);
      }
    };
  }, [
    selectedGroup?._id,
    getGroupMessages,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
  ]);

  // Scroll to the latest message
  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Get sender info from cache
  const getSender = (senderId) => {
    // Handle case where senderId is already a populated object
    if (typeof senderId === "object" && senderId._id) {
      const id = senderId._id;
      return senderCache[id] || senderId;
    }

    // Most efficient lookup from our cache
    if (senderCache[senderId]) {
      return senderCache[senderId];
    }

    // Fallback to direct lookup if not in cache yet
    if (senderId === authUser._id) {
      return authUser;
    }

    const userMatch = users.find((u) => u._id === senderId);
    if (userMatch) return userMatch;

    return {
      fullName: `User-${
        typeof senderId === "string" ? senderId.substring(0, 4) : "Unknown"
      }`,
      profilePic: null,
    };
  };

  // Handle sending message
  const handleSendMessage = async (messageData) => {
    if (!selectedGroup) return;

    try {
      await sendGroupMessage(selectedGroup._id, messageData);
    } catch (error) {
      console.error("Failed to send group message:", error);
    }
  };

  // 关闭群聊窗口
  const handleCloseChat = () => {
    setSelectedGroup(null);
  };

  if (isMessagesLoading || !selectedGroup) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="py-3 px-4 border-b border-base-300">加载中...</div>
        <MessageSkeleton />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupChatHeader
        group={selectedGroup}
        onAddMembers={() => setShowMembersModal(true)}
        onLeaveGroup={() => {
          useChatStore.getState().leaveGroup(selectedGroup._id);
        }}
        onClose={handleCloseChat}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-base-300 p-4 rounded-full mb-3">
              <UsersRound className="size-8 text-zinc-500" />
            </div>
            <h3 className="font-bold text-lg">{selectedGroup.name}</h3>
            <p className="text-zinc-500 text-center max-w-md mt-2">
              这是群聊的开始。发送一条消息与所有成员交流。
            </p>
          </div>
        ) : (
          messages.map((message, index) => {
            // Handle both string ID and populated object sender
            const senderIdValue =
              typeof message.senderId === "object"
                ? message.senderId._id
                : message.senderId;

            const isCurrentUser = senderIdValue === authUser._id;
            const sender = getSender(message.senderId);

            return (
              <div
                key={message._id}
                className={`chat ${isCurrentUser ? "chat-end" : "chat-start"}`}
                ref={index === messages.length - 1 ? messageEndRef : null}
              >
                <div className="chat-image avatar">
                  <div className="size-10 rounded-full border">
                    <img
                      src={sender.profilePic || "/avatar.png"}
                      alt="profile pic"
                    />
                  </div>
                </div>
                <div className="chat-header mb-1">
                  <span className="font-bold">{sender.fullName}</span>
                  <time className="text-xs opacity-50 ml-1">
                    {formatMessageTime(message.createdAt)}
                  </time>
                </div>
                <div className="chat-bubble flex flex-col">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p className="text-lg">{message.text}</p>}
                </div>
              </div>
            );
          })
        )}
      </div>

      <MessageInput onSendMessage={handleSendMessage} />

      {/* Group members management modal */}
      {showMembersModal && (
        <GroupMembersModal
          isOpen={showMembersModal}
          onClose={() => setShowMembersModal(false)}
          group={selectedGroup}
        />
      )}
    </div>
  );
};

export default GroupChatContainer;
