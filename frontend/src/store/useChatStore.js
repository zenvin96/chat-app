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
  isSendingMessage: false,
  activeTab: "users",
  showOnlineOnly: false,

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
      const processedMessages = res.data.map((msg) => {
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
      const updatedGroups = get().groups.filter(
        (group) => group._id !== groupId
      );
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
    if (!selectedUser) return () => {};

    const socket = useAuthStore.getState().socket;
    if (!socket) {
      console.error(
        "[ChatStore] Socket not available for subscribing to messages."
      );
      return () => {};
    }

    console.log(
      `[ChatStore] Subscribing to messages for user: ${selectedUser._id}`
    );

    const messageHandler = (newMessage) => {
      const currentSelectedUser = get().selectedUser;
      console.log(
        `[ChatStore] 'newMessage' received. CurrentSelUser=${currentSelectedUser?._id}, Sender=${newMessage.senderId}`
      );

      if (
        currentSelectedUser &&
        newMessage.senderId === currentSelectedUser._id
      ) {
        console.log(
          `[ChatStore] Message from selected user ${currentSelectedUser._id} received. Updating state.`
        );
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };

    socket.on("newMessage", messageHandler);
    console.log(
      `[ChatStore] Added 'newMessage' listener for user ${selectedUser._id}`
    );

    return () => {
      console.log(
        `[ChatStore] Unsubscribing from messages for user: ${selectedUser._id}`
      );
      socket.off("newMessage", messageHandler);
      console.log(
        `[ChatStore] Removed 'newMessage' listener for user ${selectedUser._id}`
      );
    };
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

    const socket = useAuthStore.getState().socket;
    socket.emit("leaveGroup", groupId);
    socket.off("newGroupMessage");
    socket.off("groupUpdated");
    socket.off("leftGroup");
  },

  unsubscribeFromMessages: () => {
    console.log(
      "[ChatStore] unsubscribeFromMessages called (now likely a NO-OP)."
    );
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

  setActiveTab: (tab) => set({ activeTab: tab }),

  setShowOnlineOnly: (show) => set({ showOnlineOnly: show }),

  setUsers: (users) => set({ users }),
}));
