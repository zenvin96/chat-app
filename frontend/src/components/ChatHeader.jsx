import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { ArrowLeft, Menu } from "lucide-react";
import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

const ChatHeader = ({ showBackButton }) => {
  const { selectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const { setSelectedUser } = useChatStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const handleBack = () => {
    setSelectedUser(null);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const isOnline = onlineUsers.includes(selectedUser?._id);

  return (
    <>
      <div className="py-3 px-4 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showBackButton ? (
            <button
              onClick={handleBack}
              className="btn btn-sm btn-square btn-ghost mr-1"
              aria-label="Back to contacts"
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
          <img
            src={selectedUser?.profilePic || "/avatar.png"}
            alt={selectedUser?.fullName}
            className="size-12 rounded-full"
          />
          <div>
            <h3 className="font-bold">{selectedUser?.fullName}</h3>
            <p
              className={`text-sm ${
                isOnline ? "text-green-500" : "text-zinc-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* 移动端侧边栏 */}
      {showMobileMenu && (
        <MobileSidebar onClose={() => setShowMobileMenu(false)} />
      )}
    </>
  );
};
export default ChatHeader;
