import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  groups: [],
  selectedUser: null,
  selectedGroup: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  isGroupsLoading: false,

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  getGroups: async () => {
    set({ isGroupsLoading: true });
    try {
      const res = await axiosInstance.get("/groups");
      set({ groups: res.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isGroupsLoading: false });
    }
  },

  createGroup: async (groupData) => {
    try {
      const res = await axiosInstance.post("/groups", groupData);
      set({ groups: [...get().groups, res.data] });
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  },

  getGroupMessages: async (groupId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/groups/${groupId}/messages`);

      // Process messages to ensure senderId is consistent
      const processedMessages = res.data.map((msg) => {
        // If senderId is already populated as an object with _id
        if (
          msg.senderId &&
          typeof msg.senderId === "object" &&
          msg.senderId._id
        ) {
          return msg;
        }
        return msg;
      });

      set({ messages: processedMessages });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendGroupMessage: async (groupId, messageData) => {
    const { messages } = get();
    try {
      const res = await axiosInstance.post(
        `/groups/${groupId}/messages`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  addGroupMembers: async (groupId, memberIds) => {
    try {
      const res = await axiosInstance.post("/groups/members", {
        groupId,
        memberIds,
      });

      const updatedGroups = get().groups.map((group) =>
        group._id === groupId ? res.data : group
      );

      set({ groups: updatedGroups });

      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
      throw error;
    }
  },

  leaveGroup: async (groupId) => {
    try {
      await axiosInstance.post(`/groups/leave/${groupId}`);

      // Remove group from groups list
      const updatedGroups = get().groups.filter(
        (group) => group._id !== groupId
      );

      // If current selected group is the one we're leaving, clear it
      if (get().selectedGroup?._id === groupId) {
        set({ selectedGroup: null });
      }

      set({ groups: updatedGroups });
      toast.success("您已退出该群聊");

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "退出群聊失败");
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
    console.log("subscribeToMessages");

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  subscribeToGroupMessages: (groupId) => {
    if (!groupId) return;

    const socket = useAuthStore.getState().socket;

    socket.emit("joinGroup", groupId);

    socket.on("newGroupMessage", (data) => {
      const { selectedGroup } = get();
      if (!selectedGroup || selectedGroup._id !== data.group._id) return;

      set({
        messages: [...get().messages, data.message],
      });
    });

    socket.on("groupUpdated", (updatedGroup) => {
      if (updatedGroup._id === groupId) {
        const updatedGroups = get().groups.map((group) =>
          group._id === groupId ? updatedGroup : group
        );
        set({ groups: updatedGroups });

        if (get().selectedGroup?._id === groupId) {
          set({ selectedGroup: updatedGroup });
        }
      }
    });

    socket.on("leftGroup", (leftGroupId) => {
      if (leftGroupId === groupId) {
        // 当收到自己已离开群组的通知后更新状态
        const updatedGroups = get().groups.filter(
          (group) => group._id !== leftGroupId
        );
        set({ groups: updatedGroups });

        if (get().selectedGroup?._id === leftGroupId) {
          set({ selectedGroup: null });
        }
      }
    });
  },

  unsubscribeFromGroupMessages: (groupId) => {
    if (!groupId) return;
    console.log("unsubscribeFromMessages");

    const socket = useAuthStore.getState().socket;
    socket.emit("leaveGroup", groupId);
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("leftGroup");
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    console.log("unsubscribeFromMessages");
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    set({
      selectedUser,
      selectedGroup: null,
    });
  },

  setSelectedGroup: (selectedGroup) => {
    set({
      selectedGroup,
      selectedUser: null,
    });
  },
}));
