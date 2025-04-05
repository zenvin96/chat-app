import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import { UsersRound, User } from "lucide-react";

const SidebarControls = ({ className }) => {
  // 单独选择状态和 actions
  const activeTab = useChatStore((state) => state.activeTab || "users");
  const setActiveTab = useChatStore((state) => state.setActiveTab);
  const showOnlineOnly = useChatStore((state) => state.showOnlineOnly || false);
  const setShowOnlineOnly = useChatStore((state) => state.setShowOnlineOnly);

  const { onlineUsers } = useAuthStore();

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* 选项卡切换 (用户/群组) */}
      <div className="tabs tabs-boxed bg-base-200 w-full">
        <button
          className={`tab flex-1 ${activeTab === "users" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("users")}
        >
          <User className="size-4 mr-1" />
          <span>用户</span>
        </button>
        <button
          className={`tab flex-1 ${activeTab === "groups" ? "tab-active" : ""}`}
          onClick={() => setActiveTab("groups")}
        >
          <UsersRound className="size-4 mr-1" />
          <span>群组</span>
        </button>
      </div>

      {/* 仅显示在线用户选项 (仅用户选项卡) */}
      {activeTab === "users" && (
        <div className="flex items-center justify-between flex-wrap gap-x-2 gap-y-1">
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
            ({onlineUsers.length > 0 ? onlineUsers.length - 1 : 0} 在线)
          </span>
        </div>
      )}
    </div>
  );
};

export default SidebarControls;
