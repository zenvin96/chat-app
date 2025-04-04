import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { formatMessageTime } from "../lib/utils";
import { useChatStore } from "../store/useChatStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useNavigate } from "react-router-dom";

const NotificationToast = ({ notification, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef(null);
  const closingRef = useRef(false);
  const navigate = useNavigate();

  // 从聊天状态获取设置选中用户/群组的方法
  const { setSelectedUser, setSelectedGroup, users, groups } = useChatStore();
  const { clearNotifications } = useNotificationStore();

  // 自动隐藏通知
  useEffect(() => {
    // 防止在组件卸载后设置状态
    if (closingRef.current) return;

    // 显示通知
    setIsVisible(true);

    // 设置5秒后自动关闭的定时器
    timerRef.current = setTimeout(() => {
      if (!closingRef.current) {
        closeNotification();
      }
    }, 5000); // 5秒后自动关闭

    // 清理函数
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  // 关闭通知的处理函数
  const closeNotification = () => {
    // 防止重复关闭
    if (closingRef.current) return;

    closingRef.current = true;
    setIsVisible(false);

    // 等待消失动画完成后关闭
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // 处理点击通知打开对应聊天窗口
  const handleNotificationClick = () => {
    // 清除定时关闭
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // 确保用户在主页
    if (window.location.pathname !== "/") {
      navigate("/");
    }

    // 打开相应聊天窗口
    if (notification.type === "private") {
      // 查找用户对象
      const user = users.find((u) => u._id === notification.senderId);
      if (user) {
        setSelectedUser(user);
        clearNotifications("private", user._id);
      }
    } else if (notification.type === "group") {
      // 查找群组对象
      const group = groups.find((g) => g._id === notification.groupId);
      if (group) {
        setSelectedGroup(group);
        clearNotifications("group", group._id);
      }
    }

    // 关闭通知
    closeNotification();
  };

  // 没有通知内容则不显示
  if (!notification) return null;

  const { senderName, groupName, text, type, senderProfilePic, timestamp } =
    notification;
  const source =
    type === "private" ? senderName : `${groupName}（${senderName}）`;

  return (
    <div
      className={`
        fixed top-4 right-4 z-50 w-80 bg-base-200 shadow-lg rounded-lg overflow-hidden
        transform transition-all duration-300 ease-in-out
        ${
          isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
        }
        cursor-pointer
      `}
      onClick={handleNotificationClick}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-primary text-primary-content">
        <h3 className="font-medium text-sm truncate">你有一条新的消息！</h3>
        <button
          onClick={(e) => {
            e.stopPropagation(); // 防止触发父元素的点击事件
            closeNotification();
          }}
          className="hover:bg-primary-focus rounded-full p-1"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="p-4 flex items-start gap-3">
        <div className="flex-shrink-0">
          <img
            src={senderProfilePic || "/avatar.png"}
            alt={senderName}
            className="size-10 rounded-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-base-content/80 mb-1">
            {source}
          </div>
          <div className="text-sm line-clamp-2">{text}</div>
          <div className="text-xs text-base-content/60 mt-1">
            {formatMessageTime(new Date(timestamp))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationToast;
