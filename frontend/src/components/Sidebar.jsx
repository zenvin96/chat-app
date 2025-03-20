import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, UsersRound, User } from "lucide-react";
import GroupChatModal from "./GroupChatModal";

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

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full sm:w-80 md:w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium block md:hidden lg:block">
              Contacts
            </span>
          </div>

          <button
            onClick={() => setIsGroupModalOpen(true)}
            className="btn btn-sm btn-ghost btn-circle"
            title="Create Group"
          >
            <UsersRound className="size-5" />
            <Plus className="size-3 absolute right-1 bottom-1" />
          </button>
        </div>

        {/* First row: Tab switching (Users/Groups) */}
        <div className="tabs tabs-boxed bg-base-200 w-full">
          <button
            className={`tab flex-1 ${
              activeTab === "users" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("users")}
          >
            <User className="size-4 md:mr-0 mr-1 lg:mr-1" />
            <span className="block md:hidden lg:block">Users</span>
          </button>
          <button
            className={`tab flex-1 ${
              activeTab === "groups" ? "tab-active" : ""
            }`}
            onClick={() => setActiveTab("groups")}
          >
            <UsersRound className="size-4 md:mr-0 mr-1 lg:mr-1" />
            <span className="block md:hidden lg:block">Groups</span>
          </button>
        </div>

        {/* Second row: Show online users filter (users tab only) */}
        {activeTab === "users" && (
          <div className="flex items-center justify-between mt-3">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-sm block md:hidden lg:block">
                Show online only
              </span>
            </label>
            <span className="text-xs text-zinc-500 block md:hidden lg:block">
              ({onlineUsers.length - 1} online)
            </span>
          </div>
        )}
      </div>

      {/* Users/Groups list container */}
      <div className="overflow-y-auto w-full py-3">
        {/* Users list */}
        {activeTab === "users" && (
          <>
            {filteredUsers.map((user) => (
              <button
                key={user._id}
                onClick={() => setSelectedUser(user)}
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
                <div className="relative flex-shrink-0">
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
                  <div className="font-medium truncate">{user.fullName}</div>
                  <div className="text-sm text-zinc-400">
                    {onlineUsers.includes(user._id) ? "Online" : "Offline"}
                  </div>
                </div>
              </button>
            ))}

            {filteredUsers.length === 0 && (
              <div className="text-center text-zinc-500 py-4">
                No online users
              </div>
            )}
          </>
        )}

        {/* Groups list */}
        {activeTab === "groups" && (
          <>
            {groups.length > 0 ? (
              groups.map((group) => (
                <button
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
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
                  <div className="relative flex-shrink-0">
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
                <p>No groups yet</p>
                <button
                  onClick={() => setIsGroupModalOpen(true)}
                  className="btn btn-sm btn-outline mt-2"
                >
                  Create Group
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Create group chat modal */}
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
