import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import NotificationBadge from "./NotificationBadge";
import { UsersRound } from "lucide-react";

const ContactList = ({ setIsGroupModalOpen }) => {
  const {
    users,
    groups,
    selectedUser,
    selectedGroup,
    setSelectedUser,
    setSelectedGroup,
    activeTab,
    showOnlineOnly,
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const { clearNotifications } = useNotificationStore();

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

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

  return (
    <div className="overflow-y-auto w-full py-3 flex-1">
      {" "}
      {/* 添加 flex-1 */}
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
              <div className="relative">
                {" "}
                {/* 移除 mx-auto lg:mx-0 */}
                <img
                  src={user.profilePic || "/avatar.png"}
                  alt={user.fullName} // 使用 fullName 以保持一致
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

              <div className="text-left min-w-0 flex-1">
                {" "}
                {/* 添加 flex-1 */}
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
                <div className="relative">
                  {" "}
                  {/* 移除 mx-auto lg:mx-0 */}
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

                <div className="text-left min-w-0 flex-1">
                  {" "}
                  {/* 添加 flex-1 */}
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
                onClick={() => setIsGroupModalOpen(true)} // 调用传递进来的函数
                className="btn btn-sm btn-outline mt-2"
              >
                创建群组
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ContactList;
