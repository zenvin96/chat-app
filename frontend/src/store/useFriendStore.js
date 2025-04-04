/**
 * 好友关系状态管理 - 使用Zustand管理好友相关状态
 */
import { create } from "zustand";
import toast from "react-hot-toast";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests,
} from "../lib/friendApi.js";

export const useFriendStore = create((set, get) => ({
  // 状态
  friends: [],
  searchResults: [],
  sentRequests: [],
  receivedRequests: [],
  isSearching: false,
  isLoadingFriends: false,
  isLoadingRequests: false,
  isSendingRequest: false,
  isAcceptingRequest: false,
  isCancelingRequest: false,

  // 搜索用户
  searchForUsers: async (query) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }

    set({ isSearching: true });
    try {
      const data = await searchUsers(query);
      set({ searchResults: data });
    } catch (error) {
      toast.error("搜索用户失败");
      console.error(error);
    } finally {
      set({ isSearching: false });
    }
  },

  // 发送好友请求
  sendRequest: async (receiverId) => {
    set({ isSendingRequest: true });
    try {
      await sendFriendRequest(receiverId);
      toast.success("好友请求已发送");

      // 更新搜索结果中的用户状态
      set((state) => ({
        searchResults: state.searchResults.map((user) =>
          user._id === receiverId ? { ...user, requestSent: true } : user
        ),
      }));

      // 重新加载发送的请求
      get().loadFriendRequests("sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "发送好友请求失败");
    } finally {
      set({ isSendingRequest: false });
    }
  },

  // 接受好友请求
  acceptRequest: async (senderId) => {
    set({ isAcceptingRequest: true });
    try {
      await acceptFriendRequest(senderId);
      toast.success("已接受好友请求");

      // 更新接收到的请求列表
      set((state) => ({
        receivedRequests: state.receivedRequests.filter(
          (request) => request._id !== senderId
        ),
      }));

      // 重新加载好友列表
      get().loadFriends();
    } catch (error) {
      toast.error(error.response?.data?.message || "接受好友请求失败");
    } finally {
      set({ isAcceptingRequest: false });
    }
  },

  // 取消好友请求或删除好友
  cancelRequest: async (userId, type) => {
    set({ isCancelingRequest: true });
    try {
      await cancelFriendRequest(userId, type);

      if (type === "sent") {
        toast.success("已取消好友请求");
        set((state) => ({
          sentRequests: state.sentRequests.filter(
            (request) => request._id !== userId
          ),
          searchResults: state.searchResults.map((user) =>
            user._id === userId ? { ...user, requestSent: false } : user
          ),
        }));
      } else if (type === "received") {
        toast.success("已拒绝好友请求");
        set((state) => ({
          receivedRequests: state.receivedRequests.filter(
            (request) => request._id !== userId
          ),
        }));
      } else if (type === "friend") {
        toast.success("已移除好友");
        set((state) => ({
          friends: state.friends.filter((friend) => friend._id !== userId),
        }));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "操作失败");
    } finally {
      set({ isCancelingRequest: false });
    }
  },

  // 加载好友列表
  loadFriends: async (nameFilter) => {
    set({ isLoadingFriends: true });
    try {
      const data = await getFriends(nameFilter);
      set({ friends: data });
    } catch (error) {
      toast.error("加载好友列表失败");
      console.error(error);
    } finally {
      set({ isLoadingFriends: false });
    }
  },

  // 加载好友请求列表
  loadFriendRequests: async (type) => {
    set({ isLoadingRequests: true });
    try {
      const data = await getFriendRequests(type);
      if (type === "sent") {
        set({ sentRequests: data });
      } else if (type === "received") {
        set({ receivedRequests: data });
      }
    } catch (error) {
      toast.error(`加载${type === "sent" ? "发送" : "接收"}的好友请求失败`);
      console.error(error);
    } finally {
      set({ isLoadingRequests: false });
    }
  },

  // 清空搜索结果
  clearSearchResults: () => {
    set({ searchResults: [] });
  },
}));
