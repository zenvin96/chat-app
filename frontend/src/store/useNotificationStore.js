import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";
import toast from "react-hot-toast";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCounts: {}, // 格式: { "private_userId": 数量, "group_groupId": 数量 }
  soundEnabled: localStorage.getItem("chat-sound-enabled") === "true" || false,
  badgeEnabled: localStorage.getItem("chat-badge-enabled") === "true" || true,

  // 切换声音设置
  toggleSound: () => {
    const newValue = !get().soundEnabled;
    localStorage.setItem("chat-sound-enabled", newValue);
    set({ soundEnabled: newValue });
  },

  // 切换徽章设置
  toggleBadge: () => {
    const newValue = !get().badgeEnabled;
    localStorage.setItem("chat-badge-enabled", newValue);
    set({ badgeEnabled: newValue });
  },

  // 增加未读消息计数
  incrementUnreadCount: (type, id) => {
    const key = `${type}_${id}`;
    const { unreadCounts } = get();
    const currentCount = unreadCounts[key] || 0;

    set({
      unreadCounts: {
        ...unreadCounts,
        [key]: currentCount + 1,
      },
    });

    console.log(`未读消息计数增加: ${key}, 新计数: ${currentCount + 1}`);
  },

  // 清除未读消息计数
  clearUnreadCount: (type, id) => {
    const key = `${type}_${id}`;
    const { unreadCounts } = get();

    if (unreadCounts[key]) {
      const newUnreadCounts = { ...unreadCounts };
      delete newUnreadCounts[key];

      set({ unreadCounts: newUnreadCounts });
      console.log(`已清除未读消息计数: ${key}`);
    }
  },

  // 获取未读消息计数
  getUnreadCount: (type, id) => {
    const key = `${type}_${id}`;
    const { unreadCounts } = get();
    return unreadCounts[key] || 0;
  },

  // 添加新通知
  addNotification: (notification) => {
    console.log("进入addNotification函数, 收到通知:", notification);
    const { notifications, soundEnabled } = get();

    // 检查通知是否重复
    const isDuplicate = notifications.some((n) => n.id === notification.id);
    if (isDuplicate) {
      console.log("跳过重复通知:", notification.id);
      return;
    }

    // 确保我们有正确的状态变量来检查当前聊天
    const chatStore = useChatStore.getState();
    const currentSelectedUser = chatStore.selectedUser;
    const currentSelectedGroup = chatStore.selectedGroup;

    console.log(
      "当前选中用户:",
      currentSelectedUser ? currentSelectedUser._id : "无"
    );
    console.log(
      "当前选中群组:",
      currentSelectedGroup ? currentSelectedGroup._id : "无"
    );
    console.log("通知类型:", notification.type);
    console.log("通知发送者ID:", notification.senderId);
    console.log("当前路径:", window.location.pathname);

    // 检查是否需要发送通知（用户是否已在该聊天窗口）
    const isPrivateActive =
      notification.type === "private" &&
      currentSelectedUser &&
      currentSelectedUser._id === notification.senderId &&
      window.location.pathname === "/";

    const isGroupActive =
      notification.type === "group" &&
      currentSelectedGroup &&
      currentSelectedGroup._id === notification.groupId &&
      window.location.pathname === "/";

    const isActiveChat = isPrivateActive || isGroupActive;

    console.log("私聊活跃状态:", isPrivateActive);
    console.log("群聊活跃状态:", isGroupActive);
    console.log("最终活跃状态:", isActiveChat);

    // 如果用户正在查看该聊天，不发送通知和增加未读计数
    if (isActiveChat) {
      console.log("用户正在查看聊天，跳过通知");
      return;
    }

    console.log("准备显示通知并增加计数");

    // 增加未读消息计数
    if (notification.type === "private") {
      get().incrementUnreadCount("private", notification.senderId);
    } else if (notification.type === "group") {
      get().incrementUnreadCount("group", notification.groupId);
    }

    // 播放通知音效（如果启用）
    if (soundEnabled) {
      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch((err) => console.error("无法播放通知音效:", err));
      } catch (err) {
        console.error("播放通知音效失败:", err);
      }
    }

    // 添加到通知列表（最多保留20条，避免过多）
    set({
      notifications: [notification, ...notifications].slice(0, 20),
    });

    console.log("通知已添加到列表");

    // 如果浏览器支持通知且应用在后台，发送系统通知
    if (
      document.visibilityState === "hidden" &&
      "Notification" in window &&
      Notification.permission === "granted"
    ) {
      try {
        const title =
          notification.type === "private"
            ? `来自 ${notification.senderName} 的消息`
            : `${notification.groupName} 群消息`;

        const body = notification.text || "收到一条新消息";

        new Notification(title, {
          body,
          icon: notification.senderProfilePic || "/avatar.png",
        });
        console.log("系统通知已发送");
      } catch (err) {
        console.error("系统通知发送失败:", err);
      }
    }
  },

  // 清除指定类型的通知
  clearNotifications: (type, id) => {
    const { notifications } = get();
    let updatedNotifications;

    if (type === "private") {
      updatedNotifications = notifications.filter(
        (n) => !(n.type === "private" && n.senderId === id)
      );
    } else if (type === "group") {
      updatedNotifications = notifications.filter(
        (n) => !(n.type === "group" && n.groupId === id)
      );
    } else {
      // 清除所有通知
      updatedNotifications = [];
    }

    // 同时清除未读消息计数
    if (type && id) {
      get().clearUnreadCount(type, id);
    } else {
      // 清除所有未读计数
      set({ unreadCounts: {} });
    }

    set({ notifications: updatedNotifications });
  },

  // 获取特定发送者的通知计数
  getNotificationCount: (type, id) => {
    const { notifications } = get();

    if (type === "private") {
      return notifications.filter(
        (n) => n.type === "private" && n.senderId === id
      ).length;
    } else if (type === "group") {
      return notifications.filter((n) => n.type === "group" && n.groupId === id)
        .length;
    }

    // 返回所有通知数量
    return notifications.length;
  },

  // 设置通知权限
  requestNotificationPermission: async () => {
    if (!("Notification" in window)) {
      toast.error("您的浏览器不支持通知");
      return false;
    }

    if (Notification.permission === "granted") return true;

    if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }

    return false;
  },

  // 初始化通知监听器
  initNotificationListeners: () => {
    const socket = useAuthStore.getState().socket;

    if (!socket) return;

    // 先清除可能存在的旧监听器，避免重复
    // get().removeNotificationListeners();

    // 监听私聊消息
    socket.on("newMessage", (message) => {
      // 查找发送者信息
      const sender = useChatStore
        .getState()
        .users.find((user) => user._id === message.senderId);

      if (sender) {
        console.log("收到新私聊消息:", message);
        get().addNotification({
          id: message._id,
          type: "private",
          senderId: message.senderId,
          senderName: sender.fullName,
          senderProfilePic: sender.profilePic,
          text: message.text,
          timestamp: message.createdAt || new Date().toISOString(),
        });
      }
    });

    // 监听群聊消息
    socket.on("newGroupMessage", (data) => {
      const { message, group } = data;
      const sender = useChatStore
        .getState()
        .users.find((user) => user._id === message.senderId);

      if (sender && group) {
        console.log("收到新群聊消息:", message);
        get().addNotification({
          id: message._id,
          type: "group",
          senderId: message.senderId,
          senderName: sender.fullName,
          groupId: group._id,
          groupName: group.name,
          senderProfilePic: sender.profilePic,
          text: message.text,
          timestamp: message.createdAt || new Date().toISOString(),
        });
      }
    });

    console.log("通知监听器已初始化");
  },

  // 移除通知监听器
  removeNotificationListeners: () => {
    const socket = useAuthStore.getState().socket;

    if (socket) {
      socket.off("newMessage");
      socket.off("newGroupMessage");
      console.log("通知监听器已移除");
    }
  },
}));
