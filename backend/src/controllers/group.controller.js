/**
 * 群聊控制器模块 - 处理群聊相关的功能
 * 包括创建群聊、获取群聊、添加成员等
 */
import Group from "../models/group.model.js";
import Message from "../models/message.model.js";
import { io } from "../lib/socket.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * 创建群聊控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 新创建的群聊信息
 */
export const createGroup = async (req, res) => {
  try {
    const { name, members, groupPic } = req.body;
    const creator = req.user._id;

    if (!name || !members || members.length === 0) {
      return res
        .status(400)
        .json({ message: "群聊名称和至少一个成员是必需的" });
    }

    // 确保创建者也是成员
    if (!members.includes(creator.toString())) {
      members.push(creator);
    }

    let groupPicUrl = "";
    if (groupPic) {
      const uploadResponse = await cloudinary.uploader.upload(groupPic);
      groupPicUrl = uploadResponse.secure_url;
    }

    const newGroup = new Group({
      name,
      creator,
      members,
      groupPic: groupPicUrl,
    });

    await newGroup.save();

    // 通过Socket.IO通知所有成员
    members.forEach((memberId) => {
      io.to(`user_${memberId}`).emit("newGroup", newGroup);
    });

    res.status(201).json(newGroup);
  } catch (error) {
    console.log("创建群聊时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 获取用户所有群聊控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 用户所属的所有群聊
 */
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user._id;

    const groups = await Group.find({ members: userId }).populate(
      "members",
      "fullName email profilePic"
    );

    res.status(200).json(groups);
  } catch (error) {
    console.log("获取用户群聊时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 添加成员到群聊控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 更新后的群聊信息
 */
export const addGroupMembers = async (req, res) => {
  try {
    const { groupId, memberIds } = req.body;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "找不到群聊" });
    }

    // 验证请求用户是否为群成员
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "只有群成员才能添加新成员" });
    }

    // 添加新成员
    for (const memberId of memberIds) {
      if (!group.members.includes(memberId)) {
        group.members.push(memberId);
      }
    }

    await group.save();

    // 通知新成员
    memberIds.forEach((memberId) => {
      io.to(`user_${memberId}`).emit("addedToGroup", group);
    });

    // 通知现有成员有新成员加入
    group.members.forEach((memberId) => {
      io.to(`user_${memberId}`).emit("groupUpdated", group);
    });

    res.status(200).json(group);
  } catch (error) {
    console.log("添加群成员时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 获取群聊消息历史控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 群聊消息历史
 */
export const getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    // 验证用户是否为群成员
    const group = await Group.findOne({
      _id: groupId,
      members: userId,
    });

    if (!group) {
      return res.status(403).json({ message: "无权访问此群聊" });
    }

    const messages = await Message.find({
      receiverId: groupId,
      receiverType: "Group",
    }).populate("senderId", "fullName profilePic");

    res.status(200).json(messages);
  } catch (error) {
    console.log("获取群聊消息时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 发送群聊消息控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 新发送的消息
 */
export const sendGroupMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const { groupId } = req.params;
    const senderId = req.user._id;

    // 验证用户是否为群成员
    const group = await Group.findOne({
      _id: groupId,
      members: senderId,
    });

    if (!group) {
      return res.status(403).json({ message: "您不是该群成员，无法发送消息" });
    }

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId: groupId,
      receiverType: "Group",
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // 实时通知所有群成员
    group.members.forEach((memberId) => {
      if (!memberId.equals(senderId)) {
        // 不通知发送者自己
        io.to(`user_${memberId}`).emit("newGroupMessage", {
          message: newMessage,
          group: group,
        });
      }
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.log("发送群聊消息时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 离开群聊控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 操作结果信息
 */
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user._id;

    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "找不到群聊" });
    }

    // 验证请求用户是否为群成员
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "您不是该群聊的成员" });
    }

    // 如果是创建者且群里还有其他成员，则需要转移群主权限
    if (
      group.creator.toString() === userId.toString() &&
      group.members.length > 1
    ) {
      // 找到第一个不是当前用户的成员作为新的创建者
      const newCreator = group.members.find(
        (memberId) => memberId.toString() !== userId.toString()
      );
      group.creator = newCreator;
    }

    // 从成员列表中移除用户
    group.members = group.members.filter(
      (memberId) => memberId.toString() !== userId.toString()
    );

    // 如果没有成员了，删除群聊
    if (group.members.length === 0) {
      await Group.findByIdAndDelete(groupId);
      return res.status(200).json({ message: "群聊已解散" });
    }

    await group.save();

    // 通知其他成员有人离开
    group.members.forEach((memberId) => {
      io.to(`user_${memberId}`).emit("groupUpdated", group);
    });

    // 通知当前用户已成功离开
    io.to(`user_${userId}`).emit("leftGroup", groupId);

    res.status(200).json({ message: "已成功离开群聊" });
  } catch (error) {
    console.log("离开群聊时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};
