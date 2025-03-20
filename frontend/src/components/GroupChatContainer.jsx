import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import {
  UsersRound,
  Info,
  UserPlus,
  LogOut,
  ArrowLeft,
  Menu,
} from "lucide-react";
import GroupMembersModal from "./GroupMembersModal";
import MobileSidebar from "./MobileSidebar";

const GroupChatHeader = ({
  group,
  onAddMembers,
  onLeaveGroup,
  showBackButton,
  onBack,
}) => {
  const { members } = group;
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleLeaveClick = () => {
    setShowLeaveConfirm(true);
  };

  const confirmLeave = () => {
    onLeaveGroup();
    setShowLeaveConfirm(false);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  return (
    <>
      <div className="py-3 px-4 border-b border-base-300 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={onBack}
              className="btn btn-sm btn-square btn-ghost mr-1"
              aria-label="Back to groups"
            >
              <ArrowLeft className="size-5" />
            </button>
          ) : (
            <button
              onClick={toggleMobileMenu}
              className="btn btn-sm btn-square btn-ghost md:hidden mr-1"
              aria-label="Open contacts"
            >
              <Menu className="size-5" />
            </button>
          )}
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
            <p className="text-sm text-zinc-400">{members.length} members</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddMembers}
            className="btn btn-sm btn-ghost btn-circle"
            title="Add Members"
          >
            <UserPlus className="size-5" />
          </button>
          <button
            className="btn btn-sm btn-ghost btn-circle"
            title="Group Info"
          >
            <Info className="size-5" />
          </button>
          <button
            onClick={handleLeaveClick}
            className="btn btn-sm btn-ghost btn-circle text-red-500"
            title="Leave Group"
          >
            <LogOut className="size-5" />
          </button>
        </div>

        {/* Leave Confirmation Dialog */}
        {showLeaveConfirm && (
          <div className="absolute z-20 right-0 top-[calc(100%+10px)] bg-base-200 shadow-md rounded-lg p-4 w-64">
            <h4 className="font-bold mb-2">Leave Group?</h4>
            <p className="text-sm mb-3">
              You will no longer receive messages from this group.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-sm btn-ghost"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-sm btn-error text-white"
                onClick={confirmLeave}
              >
                Leave
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 移动端侧边栏 */}
      {showMobileMenu && (
        <MobileSidebar onClose={() => setShowMobileMenu(false)} />
      )}
    </>
  );
};

const GroupChatContainer = ({ showBackButton }) => {
  const {
    messages,
    getGroupMessages,
    isMessagesLoading,
    selectedGroup,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    sendGroupMessage,
    users,
    getUsers,
    setSelectedGroup,
  } = useChatStore();

  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [senderCache, setSenderCache] = useState({});
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // 检测窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Always load users when component mounts
  useEffect(() => {
    getUsers();
  }, [getUsers]);

  // Fetch and cache sender data
  useEffect(() => {
    if (!messages || !users || users.length === 0) return;

    // Build a cache of all senders in the current messages
    const newSenderCache = { ...senderCache };
    let cacheUpdated = false;

    messages.forEach((message) => {
      const senderId = message.senderId;

      // Skip if we already have this sender cached
      if (newSenderCache[senderId]) return;

      // If senderId is an object, use the object itself
      if (typeof senderId === "object" && senderId._id) {
        newSenderCache[senderId._id] = senderId;
        cacheUpdated = true;
        return;
      }

      // If it's the current user
      if (senderId === authUser._id) {
        newSenderCache[senderId] = authUser;
        cacheUpdated = true;
        return;
      }

      // Look in users array
      const userMatch = users.find((u) => u._id === senderId);
      if (userMatch) {
        newSenderCache[senderId] = userMatch;
        cacheUpdated = true;
        return;
      }

      // Look in group members if they are objects
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

      // Default fallback
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

    if (cacheUpdated) {
      setSenderCache(newSenderCache);
    }
  }, [messages, users, selectedGroup, authUser._id, senderCache]);

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
    selectedGroup?.name,
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
      return senderId;
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

  if (isMessagesLoading || !selectedGroup) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <div className="py-3 px-4 border-b border-base-300">Loading...</div>
        <MessageSkeleton />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    );
  }

  return (
    <div
      className={`flex-1 flex flex-col overflow-auto ${
        isMobile ? "h-screen" : ""
      }`}
    >
      <GroupChatHeader
        group={selectedGroup}
        onAddMembers={() => setShowMembersModal(true)}
        onLeaveGroup={() => {
          useChatStore.getState().leaveGroup(selectedGroup._id);
        }}
        showBackButton={showBackButton}
        onBack={() => setSelectedGroup(null)}
      />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-base-300 p-4 rounded-full mb-3">
              <UsersRound className="size-8 text-zinc-500" />
            </div>
            <h3 className="font-bold text-lg">{selectedGroup.name}</h3>
            <p className="text-zinc-500 text-center max-w-md mt-2">
              This is the beginning of the group chat. Send a message to
              communicate with all members.
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
