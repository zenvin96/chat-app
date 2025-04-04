import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef } from "react";

import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
  } = useChatStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    let unsubscribe = () => {};
    if (selectedUser) {
      console.log(
        `[ChatContainer] User ${selectedUser._id} selected. Fetching messages and subscribing.`
      );
      getMessages(selectedUser._id);
      unsubscribe = subscribeToMessages();
    } else {
      console.log("[ChatContainer] No user selected.");
    }

    return () => {
      console.log(
        "[ChatContainer] Cleanup effect. Calling unsubscribe function."
      );
      unsubscribe();
    };
  }, [selectedUser, getMessages, subscribeToMessages]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  if (isMessagesLoading && !messages.length) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col justify-center items-center">
        <p>请从左侧选择一个聊天</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={
              messages.length - 1 === messages.indexOf(message)
                ? messageEndRef
                : null
            }
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div
              className={`chat-bubble flex flex-col ${
                message.senderId === authUser._id ? "chat-bubble-primary" : ""
              }`}
            >
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
        ))}
        {!isMessagesLoading && messages.length === 0 && (
          <div className="text-center text-gray-500 p-4">开始对话吧！</div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};
export default ChatContainer;
