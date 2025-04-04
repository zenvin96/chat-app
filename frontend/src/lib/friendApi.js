/**
 * 好友关系API服务 - 提供好友功能相关API调用
 */
import { axiosInstance } from "./axios.js";

/**
 * 搜索用户
 * @param {string} query - 搜索关键词(名称或邮箱)
 * @returns {Promise} 返回匹配的用户列表
 */
export const searchUsers = async (query) => {
  try {
    const response = await axiosInstance.get(`/friends/search?q=${query}`);
    return response.data;
  } catch (error) {
    console.error("搜索用户失败:", error);
    throw error;
  }
};

/**
 * 发送好友请求
 * @param {string} receiverId - 接收者用户ID
 * @returns {Promise} 返回请求结果
 */
export const sendFriendRequest = async (receiverId) => {
  try {
    const response = await axiosInstance.post("/friends/request", {
      receiverId,
    });
    return response.data;
  } catch (error) {
    console.error("发送好友请求失败:", error);
    throw error;
  }
};

/**
 * 接受好友请求
 * @param {string} senderId - 发送者用户ID
 * @returns {Promise} 返回请求结果
 */
export const acceptFriendRequest = async (senderId) => {
  try {
    const response = await axiosInstance.post("/friends/accept", { senderId });
    return response.data;
  } catch (error) {
    console.error("接受好友请求失败:", error);
    throw error;
  }
};

/**
 * 取消好友请求或移除好友
 * @param {string} userId - 用户ID
 * @param {string} type - 操作类型：'sent', 'received', 'friend'
 * @returns {Promise} 返回请求结果
 */
export const cancelFriendRequest = async (userId, type) => {
  try {
    const response = await axiosInstance.post("/friends/cancel", {
      userId,
      type,
    });
    return response.data;
  } catch (error) {
    console.error("取消好友请求失败:", error);
    throw error;
  }
};

/**
 * 获取好友列表
 * @param {string} [fullName] - 可选，按名称筛选
 * @returns {Promise} 返回好友列表
 */
export const getFriends = async (fullName) => {
  try {
    const url = fullName ? `/friends/${fullName}` : "/friends";
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("获取好友列表失败:", error);
    throw error;
  }
};

/**
 * 获取好友请求列表
 * @param {string} type - 请求类型：'sent' 或 'received'
 * @returns {Promise} 返回好友请求列表
 */
export const getFriendRequests = async (type) => {
  try {
    const response = await axiosInstance.get(`/friends/requests?type=${type}`);
    return response.data.requests;
  } catch (error) {
    console.error("获取好友请求列表失败:", error);
    throw error;
  }
};
