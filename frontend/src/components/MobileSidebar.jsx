import { useState, useEffect } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { X, UsersRound, User } from "lucide-react";

const MobileSidebar = ({ onClose }) => {
  const {
    users,
    groups,
    setSelectedUser,
    setSelectedGroup,
    selectedUser,
    selectedGroup,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const [activeTab, setActiveTab] = useState("users"); // "users" or "groups"
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  // 当选择了用户或群组时自动关闭侧边栏
  useEffect(() => {
    if (selectedUser || selectedGroup) {
      onClose();
    }
  }, [selectedUser, selectedGroup, onClose]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  return (
    <div className="fixed inset-0 z-50 bg-base-200/80 backdrop-blur-sm md:hidden">
      <div className="w-3/4 max-w-xs h-full bg-base-100 shadow-xl overflow-hidden flex flex-col animate-slide-in-left">
        {/* 顶部标题栏 */}
        <div className="p-4 border-b border-base-300 flex items-center justify-between">
          <h2 className="font-bold text-lg">Chat</h2>
          <button onClick={onClose} className="btn btn-sm btn-circle btn-ghost">
            <X size={20} />
          </button>
        </div>

        {/* 标签切换 */}
        <div className="p-3">
          <div className="tabs tabs-boxed bg-base-200 w-full">
            <button
              className={`tab flex-1 ${
                activeTab === "users" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("users")}
            >
              <User className="size-4 mr-1" />
              <span>Users</span>
            </button>
            <button
              className={`tab flex-1 ${
                activeTab === "groups" ? "tab-active" : ""
              }`}
              onClick={() => setActiveTab("groups")}
            >
              <UsersRound className="size-4 mr-1" />
              <span>Groups</span>
            </button>
          </div>

          {/* 在线用户过滤 */}
          {activeTab === "users" && (
            <div className="flex items-center justify-between mt-3">
              <label className="cursor-pointer flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="checkbox checkbox-sm"
                />
                <span className="text-sm">Show online only</span>
              </label>
              <span className="text-xs text-zinc-500">
                ({onlineUsers.length - 1} online)
              </span>
            </div>
          )}
        </div>

        {/* 列表区域 */}
        <div className="flex-1 overflow-y-auto">
          {/* 用户列表 */}
          {activeTab === "users" && (
            <div className="p-2">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => setSelectedUser(user)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-base-300 rounded-lg transition-colors"
                  >
                    <div className="relative">
                      <img
                        src={user.profilePic || "/avatar.png"}
                        alt={user.name}
                        className="size-12 object-cover rounded-full"
                      />
                      {onlineUsers.includes(user._id) && (
                        <span
                          className="absolute bottom-0 right-0 size-3 bg-green-500 
                          rounded-full ring-2 ring-base-100"
                        />
                      )}
                    </div>
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-zinc-400">
                        {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-4">
                  No {showOnlineOnly ? "online " : ""}users
                </div>
              )}
            </div>
          )}

          {/* 群组列表 */}
          {activeTab === "groups" && (
            <div className="p-2">
              {groups.length > 0 ? (
                groups.map((group) => (
                  <button
                    key={group._id}
                    onClick={() => setSelectedGroup(group)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-base-300 rounded-lg transition-colors"
                  >
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
                    <div className="text-left min-w-0">
                      <div className="font-medium truncate">{group.name}</div>
                      <div className="text-sm text-zinc-400">
                        {group.members.length} members
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-zinc-500 py-4">
                  No groups yet
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileSidebar;
