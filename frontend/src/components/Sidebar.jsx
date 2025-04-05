import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users, Plus, UsersRound } from "lucide-react";
import GroupChatModal from "./GroupChatModal";
import SidebarControls from "./SidebarControls";
import ContactList from "./ContactList";

const Sidebar = () => {
  const {
    getUsers,
    users,
    getGroups,
    isUsersLoading,
    isGroupsLoading,
    activeTab,
  } = useChatStore();

  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  useEffect(() => {
    getUsers();
    getGroups();
  }, [getUsers, getGroups]);

  const isLoading = activeTab === "users" ? isUsersLoading : isGroupsLoading;

  if (isLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-full lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-4 hidden lg:flex lg:flex-col">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="size-6" />
            <span className="font-medium">联系人</span>
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

        <SidebarControls className="hidden lg:flex lg:flex-col" />
      </div>

      <ContactList setIsGroupModalOpen={setIsGroupModalOpen} />

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
