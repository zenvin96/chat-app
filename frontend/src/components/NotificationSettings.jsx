import { Bell, BellRing, Volume2, VolumeX } from "lucide-react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useEffect } from "react";

const NotificationSettings = () => {
  const {
    soundEnabled,
    badgeEnabled,
    toggleSound,
    toggleBadge,
    requestNotificationPermission,
  } = useNotificationStore();

  // 在组件挂载时请求通知权限
  useEffect(() => {
    // 浏览器支持通知时请求权限
    if ("Notification" in window) {
      requestNotificationPermission();
    }
  }, [requestNotificationPermission]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <h2 className="text-xl font-medium">通知设置</h2>

      <div className="divider my-1"></div>

      {/* 通知徽章开关 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {badgeEnabled ? (
            <BellRing className="size-5" />
          ) : (
            <Bell className="size-5" />
          )}
          <span>消息徽章通知</span>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={badgeEnabled}
          onChange={toggleBadge}
        />
      </div>

      {/* 声音通知开关 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {soundEnabled ? (
            <Volume2 className="size-5" />
          ) : (
            <VolumeX className="size-5" />
          )}
          <span>声音通知</span>
        </div>
        <input
          type="checkbox"
          className="toggle toggle-primary"
          checked={soundEnabled}
          onChange={toggleSound}
        />
      </div>

      {/* 通知权限提示 */}
      {"Notification" in window && Notification.permission === "denied" && (
        <div className="bg-warning text-warning-content p-2 rounded-md text-sm mt-2">
          您已禁止浏览器通知，请在浏览器设置中允许此网站发送通知。
        </div>
      )}
    </div>
  );
};

export default NotificationSettings;
