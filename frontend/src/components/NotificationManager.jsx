import { useEffect, useState, useCallback, useRef } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import NotificationToast from "./NotificationToast";

const NotificationManager = () => {
  const { notifications } = useNotificationStore();
  const [activeNotification, setActiveNotification] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [queue, setQueue] = useState([]);

  // 使用ref记录已经处理过的通知ID，防止重复处理
  const processedNotifications = useRef(new Set());

  // 封装关闭通知的处理函数，避免依赖变化
  const handleClose = useCallback(() => {
    setActiveNotification(null);
  }, []);

  // 监听新通知并添加到队列
  useEffect(() => {
    // 只在文档可见时处理新的应用内通知
    if (document.visibilityState === "visible" && notifications.length > 0) {
      // 找出尚未处理的新通知
      const newNotifications = notifications.filter((notif) => {
        // 跳过已经在队列中或正在显示的通知
        const isInQueue = queue.some((q) => q.id === notif.id);
        const isActive =
          activeNotification && activeNotification.id === notif.id;
        const isProcessed = processedNotifications.current.has(notif.id);

        return !isInQueue && !isActive && !isProcessed;
      });

      if (newNotifications.length > 0) {
        // 仅添加新通知到队列
        setQueue((prev) => [...prev, ...newNotifications]);
      }
    }
  }, [notifications]); // 仅依赖notifications，避免循环依赖

  // 处理通知队列
  useEffect(() => {
    // 如果没有活动通知且队列不为空，显示下一个通知
    if (!isProcessing && !activeNotification && queue.length > 0) {
      setIsProcessing(true);

      // 取出队列中的第一个通知
      const nextNotification = queue[0];
      const newQueue = queue.slice(1);

      // 标记为已处理，防止重复添加
      processedNotifications.current.add(nextNotification.id);

      // 更新状态
      setQueue(newQueue);
      setActiveNotification(nextNotification);
      setIsProcessing(false);
    }
  }, [isProcessing, activeNotification, queue]);

  // 如果没有活动通知，则不渲染任何内容
  if (!activeNotification) {
    return null;
  }

  // 渲染通知组件
  return (
    <NotificationToast
      notification={activeNotification}
      onClose={handleClose}
    />
  );
};

export default NotificationManager;
