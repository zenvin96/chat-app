/**
 * 消息模型 - 定义聊天消息的数据结构
 * 用于存储和管理用户之间的聊天记录
 */
import mongoose from "mongoose";

/**
 * 消息数据模式定义
 * @typedef {Object} Message
 * @property {ObjectId} senderId - 发送消息的用户ID(关联User模型)
 * @property {ObjectId} receiverId - 接收消息的用户ID(关联User模型)
 * @property {String} text - 文本消息内容(可选)
 * @property {String} image - 图片消息URL(可选)
 * @property {Date} createdAt - 消息创建时间(自动生成)
 * @property {Date} updatedAt - 消息更新时间(自动生成)
 */
const messageSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 引用用户模型
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "receiverType", // 动态引用
      required: true,
    },
    receiverType: {
      type: String,
      enum: ["User", "Group"], // 接收者可以是用户或群组
      required: true,
    },
    text: {
      type: String, // 文本消息(可选)
    },
    image: {
      type: String, // 图片URL(可选)
    },
  },
  { timestamps: true } // 自动添加与管理createdAt和updatedAt字段
);

// 创建模型
const Message = mongoose.model("Message", messageSchema);

export default Message;
