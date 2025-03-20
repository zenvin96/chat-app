import { useChatStore } from "../store/useChatStore";
import { useState, useEffect } from "react";

import Sidebar from "../components/Sidebar";
import NoChatSelected from "../components/NoChatSelected";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";
import MobileSidebar from "../components/MobileSidebar";

const HomePage = () => {
  const { selectedUser, selectedGroup } = useChatStore();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // 是否有活跃聊天
  const isChatActive = selectedUser || selectedGroup;

  // 检测窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 处理移动菜单打开
  const handleOpenMobileMenu = () => {
    setShowMobileSidebar(true);
  };

  return (
    <div className="h-screen bg-base-200">
      <div
        className={`
        flex items-center justify-center 
        ${isMobile && isChatActive ? "pt-0" : "pt-4 sm:pt-8 md:pt-12 lg:pt-20"} 
        px-0 sm:px-4
      `}
      >
        <div
          className={`
          bg-base-100 rounded-lg shadow-xl w-full max-w-6xl 
          ${
            isMobile && isChatActive
              ? "h-screen rounded-none"
              : "h-[calc(100vh-2rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] lg:h-[calc(100vh-8rem)]"
          }
        `}
        >
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* 在移动端，如果选择了对话则隐藏侧边栏 */}
            {!(isMobile && (selectedUser || selectedGroup)) && <Sidebar />}

            {/* 聊天内容区域 */}
            {!selectedUser && !selectedGroup ? (
              <NoChatSelected
                showMenuButton={isMobile}
                onOpenMenu={handleOpenMobileMenu}
              />
            ) : selectedGroup ? (
              <GroupChatContainer showBackButton={isMobile} />
            ) : (
              <ChatContainer showBackButton={isMobile} />
            )}
          </div>
        </div>
      </div>

      {/* 移动端侧边栏 */}
      {showMobileSidebar && (
        <MobileSidebar onClose={() => setShowMobileSidebar(false)} />
      )}
    </div>
  );
};
export default HomePage;
