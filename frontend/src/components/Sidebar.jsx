import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, UsersRound, User } from "lucide-react";
import GroupChatModal from "./GroupChatModal";
import NotificationBadge from "./NotificationBadge";

const Sidebar = () => {
  const {
    getUsers,
    users,
    getGroups,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    isUsersLoading,
    isGroupsLoading,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const { clearNotifications } = useNotificationStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("users"); // "users" or "groups"
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  const isLoading = activeTab === "users" ? isUsersLoading : isGroupsLoading;

  // 处理用户选择，清除相关通知
  const handleUserSelect = (user) => {
    setSelectedUser(user);
    clearNotifications("private", user._id);
  };

  // 处理群组选择，清除相关通知
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    clearNotifications("group", group._id);
  };

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium hidden lg:block">联系人</span>
          </div>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="btn btn-sm btn-ghost btn-circle"
            title="创建群组"
          >
            <UsersRound className="size-5" />
            <Plus className="size-3 absolute right-1 bottom-1" />
          </button>
        </div>

        {/* 选项卡切换 (用户/群组) */}
        <div className="tabs tabs-boxed bg-base-200 w-full">
          <button
            className={`tab flex-1 ${
              activeTab === "users" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <User className="size-4 mr-1" />
            <span>用户</span>
          </button>
          <button
            className={`tab flex-1 ${
              activeTab === "groups" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <UsersRound className="size-4 mr-1" />
            <span>群组</span>
          </button>
        </div>

        {/* 仅显示在线用户选项 (仅用户选项卡) */}
        {activeTab === "users" && (
          <div className="flex items-center justify-between mt-3">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm">只显示在线用户</span>
            </label>
            <span className="text-xs text-zinc-500">
              ({onlineUsers.length - 1} 在线)
            </span>
          </div>
        )}
      </div>

      {/* 用户/群组列表容器 */}
      <div className="overflow-y-auto w-full py-3">
        {/* 用户列表 */}
        {activeTab === "users" && (
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => handleUserSelect(user)}
                className={`
                  w-full p-3 flex items-center gap-3
                  hover:bg-base-300 transition-colors
                  ${
                    selectedUser?._id === user._id
                      ? "bg-base-300 ring-1 ring-base-300"
                      : ""
                  }
                `}
              >
                <div className="relative mx-auto lg:mx-0">
                  <img
                    src={user.profilePic || "/avatar.png"}
                    alt={user.name}
                    className="size-12 object-cover rounded-full"
                  />
                  {onlineUsers.includes(user._id) && (
                    <span
                      className="absolute bottom-0 right-0 size-3 bg-green-500 
                      rounded-full ring-2 ring-zinc-900"
                    />
                  )}
                  <NotificationBadge type="private" id={user._id} />
                </div>

                <div className="hidden lg:block text-left min-w-0">
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "在线" : "离线"}
                  </div>
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">没有在线用户</div>
            )}
          </>
        )}

        {/* 群组列表 */}
        {activeTab === "groups" && (
          <>
            {groups.length > 0 ? (
              groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => handleGroupSelect(group)}
                  className={`
                    w-full p-3 flex items-center gap-3
                    hover:bg-base-300 transition-colors
                    ${
                      selectedGroup?._id === group._id
                        ? "bg-base-300 ring-1 ring-base-300"
                        : ""
                    }
                  `}
                >
                  <div className="relative mx-auto lg:mx-0">
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
                    <NotificationBadge type="group" id={group._id} />
                  </div>

                  <div className="hidden lg:block text-left min-w-0">
                    <div className="font-medium truncate">{group.name}</div>
                    <div className="text-sm text-zinc-400">
                      {group.members.length} 位成员
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-zinc-500 py-4">
                <p>暂无群组</p>
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="btn btn-sm btn-outline mt-2"
                >
                  创建群组
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 创建群聊模态框 */}
      {isGroupModalOpen && (
        <GroupChatModal
          isOpen={isGroupModalOpen}
          onClose={() => setIsGroupModalOpen(false)}
          users={users}
        />
      )}
    </aside>
  );
};
export default Sidebar;
