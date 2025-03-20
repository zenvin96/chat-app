/**
 * 用户模型 - 定义用户数据结构
 * 用于用户账户管理和身份验证
 */
import mongoose from "mongoose";

/**
 * 用户数据模式定义
 * @typedef {Object} User
 * @property {String} email - 用户邮箱地址(唯一)
 * @property {String} fullName - 用户全名
 * @property {String} password - 加密的用户密码
 * @property {String} profilePic - 用户头像URL
 * @property {Date} createdAt - 创建时间(自动生成)
 * @property {Date} updatedAt - 更新时间(自动生成)
 */
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true, // 确保邮箱唯一性
    },
    fullName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6, // 密码最小长度要求
    },
    profilePic: {
      type: String,
      default: "", // 默认为空字符串，表示使用默认头像
    },
  },
  { timestamps: true } // 自动添加与管理createdAt和updatedAt字段
);

// 创建模型
const User = mongoose.model("User", userSchema);

export default User;
