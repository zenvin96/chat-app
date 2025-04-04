import { MessageSquare, Menu } from "lucide-react";

const NoChatSelected = ({ showMenuButton, onOpenMenu }) => {
  return (
    <div className="w-full flex flex-1 flex-col bg-base-100">
      {/* 导航栏 */}
      {showMenuButton && (
        <div className="p-4 border-b border-base-300">
          <button
            onClick={onOpenMenu}
            className="btn btn-sm btn-ghost btn-circle"
            aria-label="Open contacts"
          >
            <Menu className="size-5" />
          </button>
        </div>
      )}

      {/* 主要内容 */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 md:p-16">
        <div className="max-w-md text-center space-y-4 sm:space-y-6">
          {/* 图标显示 */}
          <div className="mx-auto bg-primary/10 rounded-full p-5 sm:p-6 w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center mb-6">
            <MessageSquare className="text-primary w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          {/* 欢迎文字 */}
          <h2 className="text-xl sm:text-2xl font-bold text-base-content">
            欢迎使用沙聊！
          </h2>
          <p className="text-sm sm:text-base text-base-content/60 max-w-xs mx-auto">
            从左侧选择一个联系人开始聊天
          </p>
        </div>
      </div>
    </div>
  );
};

export default NoChatSelected;
