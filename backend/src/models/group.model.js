/**
 * 群聊模型 - 定义群聊的数据结构
 * 用于管理群聊及其成员
 */
import mongoose from "mongoose";

/**
 * 群聊数据模式定义
 * @typedef {Object} Group
 * @property {String} name - 群聊名称
 * @property {ObjectId} creator - 创建者ID(关联User模型)
 * @property {Array<ObjectId>} members - 群聊成员ID列表(关联User模型)
 * @property {String} groupPic - 群聊头像URL(可选)
 * @property {Date} createdAt - 群聊创建时间(自动生成)
 * @property {Date} updatedAt - 群聊更新时间(自动生成)
 */
const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    groupPic: {
      type: String,
      default: "", // 默认群聊头像
    },
  },
  { timestamps: true }
);

const Group = mongoose.model("Group", groupSchema);

export default Group;
