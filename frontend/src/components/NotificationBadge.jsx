import { useNotificationStore } from "../store/useNotificationStore";

const NotificationBadge = ({ type, id }) => {
  const { getUnreadCount, badgeEnabled } = useNotificationStore();

  // 获取未读消息数量
  const count = getUnreadCount(type, id);

  // 如果未读消息为0或徽章功能被禁用，不显示徽章
  if (count === 0 || !badgeEnabled) return null;

  return (
    <span className="absolute -top-2 -right-2 flex items-center justify-center bg-error text-error-content text-xs rounded-full h-5 w-5 min-w-5">
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default NotificationBadge;
