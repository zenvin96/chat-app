import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

/**
 * 获取侧边栏用户列表控制器
 * @param {Object} req - Express请求对象，包含当前登录用户信息
 * @param {Object} res - Express响应对象
 * @returns {Object} 包含所有其他用户信息的JSON响应
 */
export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    // 查找除当前登录用户外的所有用户，并排除密码字段
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 获取聊天消息历史控制器
 * @param {Object} req - Express请求对象，包含聊天对象的用户ID
 * @param {Object} res - Express响应对象
 * @returns {Object} 包含聊天消息历史的JSON响应
 */
export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // 查询当前用户与目标用户之间的所有消息记录
    // 考虑receiverType为"User"的消息
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId, receiverType: "User" },
        { senderId: userToChatId, receiverId: myId, receiverType: "User" },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * 发送消息控制器
 * @param {Object} req - Express请求对象，包含消息内容、图片和接收者ID
 * @param {Object} res - Express响应对象
 * @returns {Object} 包含新创建消息的JSON响应
 */
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      // 如果消息包含图片，将base64编码的图片上传到Cloudinary
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    // 创建新消息对象
    const newMessage = new Message({
      senderId,
      receiverId,
      receiverType: "User",
      text,
      image: imageUrl,
    });

    // 保存消息到数据库
    await newMessage.save();

    // 发送到用户专属房间，而不是使用socketId
    io.to(`user_${receiverId}`).emit("newMessage", newMessage);

    // 返回新创建的消息
    res.status(201).json(newMessage);
  } catch (error) {
    console.log("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
