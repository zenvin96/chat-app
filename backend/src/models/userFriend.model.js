/**
 * 用户好友关系模型 - 定义用户好友数据结构
 * 用于管理用户间的好友关系和好友请求
 */
import mongoose from "mongoose";

/**
 * 用户好友关系数据模式定义
 * @typedef {Object} UserFriend
 * @property {ObjectId} userId - 用户ID（关联到User模型）
 * @property {Array<ObjectId>} friends - 该用户的好友列表
 * @property {Array<ObjectId>} sentRequests - 该用户发送的好友请求
 * @property {Array<ObjectId>} receivedRequests - 该用户收到的好友请求
 */
const userFriendSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // 每个用户只能有一个好友关系记录
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    sentRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    receivedRequests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true } // 自动添加与管理createdAt和updatedAt字段
);

// 创建模型
const UserFriend = mongoose.model("UserFriend", userFriendSchema);

export default UserFriend;
