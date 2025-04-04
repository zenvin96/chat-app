import Navbar from "./components/Navbar";

import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import FriendsPage from "./pages/FriendsPage";

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useThemeStore } from "./store/useThemeStore";
import { useNotificationStore } from "./store/useNotificationStore";
import { useChatStore } from "./store/useChatStore";
import { useEffect, useRef } from "react";

import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import NotificationManager from "./components/NotificationManager";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers } = useAuthStore();
  const { theme } = useThemeStore();
  const {
    initNotificationListeners,
    removeNotificationListeners,
    requestNotificationPermission,
  } = useNotificationStore();
  const { setSelectedUser, setSelectedGroup } = useChatStore();
  const location = useLocation();

  // 使用ref追踪通知是否已初始化，避免重复初始化
  const notificationInitialized = useRef(false);

  console.log({ onlineUsers });

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // 初始化通知系统
  useEffect(() => {
    if (authUser && !notificationInitialized.current) {
      // 请求通知权限
      requestNotificationPermission();
      // 初始化通知监听器
      initNotificationListeners();
      notificationInitialized.current = true;

      console.log("通知系统已初始化");
    } else if (!authUser && notificationInitialized.current) {
      // 用户登出时清除通知监听
      removeNotificationListeners();
      notificationInitialized.current = false;

      console.log("通知系统已清除");
    }

    // 组件卸载时移除监听器
    return () => {
      if (notificationInitialized.current) {
        removeNotificationListeners();
        notificationInitialized.current = false;
      }
    };
  }, [
    authUser,
    initNotificationListeners,
    removeNotificationListeners,
    requestNotificationPermission,
  ]);

  // 监听路由变化，如果不在主页则清除选中的用户和群组
  useEffect(() => {
    // 如果不在主页，则清除选中的聊天
    if (location.pathname !== "/") {
      setSelectedUser(null);
      setSelectedGroup(null);
    }
  }, [location.pathname, setSelectedUser, setSelectedGroup]);

  console.log({ authUser });

  if (isCheckingAuth && !authUser)
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div data-theme={theme}>
      <Navbar />

      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/friends"
          element={authUser ? <FriendsPage /> : <Navigate to="/login" />}
        />
      </Routes>

      <Toaster />
      {authUser && <NotificationManager />}
    </div>
  );
};
export default App;
