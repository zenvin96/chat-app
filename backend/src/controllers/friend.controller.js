/**
 * 好友关系控制器 - 处理与用户好友关系相关的请求
 */
import User from "../models/user.model.js";
import UserFriend from "../models/userFriend.model.js";
import mongoose from "mongoose";

/**
 * 搜索用户 - 根据姓名或邮箱查找用户
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    const currentUserId = req.user._id;

    if (!q) {
      return res.status(400).json({ message: "请提供搜索关键词" });
    }

    // 获取当前用户的好友关系记录
    let userFriend = await UserFriend.findOne({ userId: currentUserId });

    // 准备ID列表（确保是字符串格式）
    let friendIds = [];
    let sentRequestIds = [];
    let receivedRequestIds = [];

    if (userFriend) {
      // 将ObjectId转换为字符串以便正确比较
      friendIds = userFriend.friends.map((id) => id.toString());
      sentRequestIds = userFriend.sentRequests.map((id) => id.toString());
      receivedRequestIds = userFriend.receivedRequests.map((id) =>
        id.toString()
      );
    }

    // 构建排除条件：排除当前用户自己、已是好友的用户、已发送请求的用户
    const excludeIds = [currentUserId, ...friendIds, ...sentRequestIds];

    // 根据姓名或邮箱执行模糊查询
    const users = await User.find({
      _id: { $nin: excludeIds },
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ],
    }).select("_id fullName email profilePic");

    // 返回格式应该与前端匹配
    const usersWithStatus = users.map((user) => {
      const userId = user._id.toString();
      return {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        profilePic: user.profilePic,
        isFriend: friendIds.includes(userId),
        requestSent: sentRequestIds.includes(userId),
        requestReceived: receivedRequestIds.includes(userId),
      };
    });

    res.status(200).json(usersWithStatus);
  } catch (error) {
    console.error("搜索用户时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 发送好友请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const currentUserId = req.user._id;

    // 基础验证
    if (!receiverId) {
      return res.status(400).json({ message: "请提供目标用户ID" });
    }

    // 验证目标用户ID格式
    if (!mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "无效的用户ID格式" });
    }

    // 不能添加自己为好友
    if (receiverId === currentUserId.toString()) {
      return res.status(400).json({ message: "不能添加自己为好友" });
    }

    // 检查目标用户是否存在
    const targetUser = await User.findById(receiverId);
    if (!targetUser) {
      return res.status(404).json({ message: "目标用户不存在" });
    }

    // 获取或创建当前用户的好友关系记录
    let currentUserFriend = await UserFriend.findOne({ userId: currentUserId });
    if (!currentUserFriend) {
      currentUserFriend = new UserFriend({
        userId: currentUserId,
        friends: [],
        sentRequests: [],
        receivedRequests: [],
      });
    }

    // 获取或创建目标用户的好友关系记录
    let targetUserFriend = await UserFriend.findOne({ userId: receiverId });
    if (!targetUserFriend) {
      targetUserFriend = new UserFriend({
        userId: receiverId,
        friends: [],
        sentRequests: [],
        receivedRequests: [],
      });
    }

    // 验证是否已经是好友
    if (currentUserFriend.friends.includes(receiverId)) {
      return res.status(400).json({ message: "该用户已经是您的好友" });
    }

    // 验证是否已经发送过请求
    if (currentUserFriend.sentRequests.includes(receiverId)) {
      return res.status(400).json({ message: "您已经向该用户发送过好友请求" });
    }

    // 检查对方是否已经向你发送过请求
    if (currentUserFriend.receivedRequests.includes(receiverId)) {
      // 如果对方已经发送请求，则直接加为好友
      currentUserFriend.friends.push(receiverId);
      currentUserFriend.receivedRequests =
        currentUserFriend.receivedRequests.filter(
          (id) => id.toString() !== receiverId
        );

      targetUserFriend.friends.push(currentUserId);
      targetUserFriend.sentRequests = targetUserFriend.sentRequests.filter(
        (id) => id.toString() !== currentUserId.toString()
      );

      await currentUserFriend.save();
      await targetUserFriend.save();

      return res.status(200).json({
        message: "好友请求已接受，你们现在是好友了",
        status: "friends",
      });
    }

    // 发送好友请求
    currentUserFriend.sentRequests.push(receiverId);
    targetUserFriend.receivedRequests.push(currentUserId);

    await currentUserFriend.save();
    await targetUserFriend.save();

    res.status(200).json({
      message: "好友请求已发送",
      status: "pending",
    });
  } catch (error) {
    console.error("发送好友请求时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 接受好友请求
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const { senderId } = req.body;
    const currentUserId = req.user._id;

    // 基础验证
    if (!senderId) {
      return res.status(400).json({ message: "请提供发送请求的用户ID" });
    }

    // 验证用户ID格式
    if (!mongoose.Types.ObjectId.isValid(senderId)) {
      return res.status(400).json({ message: "无效的用户ID格式" });
    }

    // 获取当前用户的好友关系记录
    let currentUserFriend = await UserFriend.findOne({ userId: currentUserId });
    if (!currentUserFriend) {
      return res.status(404).json({ message: "未找到您的好友关系记录" });
    }

    // 获取发送请求者的好友关系记录
    let requesterFriend = await UserFriend.findOne({ userId: senderId });
    if (!requesterFriend) {
      return res.status(404).json({ message: "未找到请求者的好友关系记录" });
    }

    // 验证是否收到了来自该用户的请求
    if (!currentUserFriend.receivedRequests.includes(senderId)) {
      return res.status(400).json({ message: "未找到来自该用户的好友请求" });
    }

    // 接受好友请求
    // 1. 从receivedRequests中移除该用户
    currentUserFriend.receivedRequests =
      currentUserFriend.receivedRequests.filter(
        (id) => id.toString() !== senderId
      );
    // 2. 添加到friends列表
    currentUserFriend.friends.push(senderId);

    // 更新请求者的记录
    // 1. 从sentRequests中移除当前用户
    requesterFriend.sentRequests = requesterFriend.sentRequests.filter(
      (id) => id.toString() !== currentUserId.toString()
    );
    // 2. 添加到friends列表
    requesterFriend.friends.push(currentUserId);

    await currentUserFriend.save();
    await requesterFriend.save();

    res.status(200).json({
      message: "好友请求已接受",
      status: "friends",
    });
  } catch (error) {
    console.error("接受好友请求时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 取消好友请求或移除好友
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const cancelFriendRequest = async (req, res) => {
  try {
    const { userId, type } = req.body;
    const currentUserId = req.user._id;

    // 基础验证
    if (!userId) {
      return res.status(400).json({ message: "请提供目标用户ID" });
    }

    // 验证目标用户ID格式
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "无效的用户ID格式" });
    }

    // 验证类型
    if (!type || !["sent", "received", "friend"].includes(type)) {
      return res
        .status(400)
        .json({ message: "请提供有效的类型：sent, received 或 friend" });
    }

    // 获取当前用户的好友关系记录
    let currentUserFriend = await UserFriend.findOne({ userId: currentUserId });
    if (!currentUserFriend) {
      return res.status(404).json({ message: "未找到您的好友关系记录" });
    }

    // 获取目标用户的好友关系记录
    let targetUserFriend = await UserFriend.findOne({ userId });
    if (!targetUserFriend) {
      return res.status(404).json({ message: "未找到目标用户的好友关系记录" });
    }

    // 根据不同类型执行不同操作
    switch (type) {
      case "sent":
        // 取消发送的好友请求
        if (!currentUserFriend.sentRequests.includes(userId)) {
          return res
            .status(400)
            .json({ message: "您没有向该用户发送过好友请求" });
        }

        // 从发送者的sentRequests中移除
        currentUserFriend.sentRequests = currentUserFriend.sentRequests.filter(
          (id) => id.toString() !== userId
        );

        // 从接收者的receivedRequests中移除
        targetUserFriend.receivedRequests =
          targetUserFriend.receivedRequests.filter(
            (id) => id.toString() !== currentUserId.toString()
          );

        await currentUserFriend.save();
        await targetUserFriend.save();

        return res.status(200).json({
          message: "已取消好友请求",
          status: "not_friends",
        });

      case "received":
        // 拒绝收到的好友请求
        if (!currentUserFriend.receivedRequests.includes(userId)) {
          return res
            .status(400)
            .json({ message: "您没有收到来自该用户的好友请求" });
        }

        // 从接收者的receivedRequests中移除
        currentUserFriend.receivedRequests =
          currentUserFriend.receivedRequests.filter(
            (id) => id.toString() !== userId
          );

        // 从发送者的sentRequests中移除
        targetUserFriend.sentRequests = targetUserFriend.sentRequests.filter(
          (id) => id.toString() !== currentUserId.toString()
        );

        await currentUserFriend.save();
        await targetUserFriend.save();

        return res.status(200).json({
          message: "已拒绝好友请求",
          status: "not_friends",
        });

      case "friend":
        // 移除好友
        if (!currentUserFriend.friends.includes(userId)) {
          return res.status(400).json({ message: "该用户不是您的好友" });
        }

        // 从当前用户的friends中移除
        currentUserFriend.friends = currentUserFriend.friends.filter(
          (id) => id.toString() !== userId
        );

        // 从目标用户的friends中移除
        targetUserFriend.friends = targetUserFriend.friends.filter(
          (id) => id.toString() !== currentUserId.toString()
        );

        await currentUserFriend.save();
        await targetUserFriend.save();

        return res.status(200).json({
          message: "已移除好友",
          status: "not_friends",
        });

      default:
        return res.status(400).json({
          message: "无效的操作类型，请使用：sent, received 或 friend",
        });
    }
  } catch (error) {
    console.error("取消好友请求或移除好友时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 获取好友列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const getFriends = async (req, res) => {
  try {
    const { fullName } = req.params;
    const currentUserId = req.user._id;

    // 获取当前用户的好友关系记录
    let userFriend = await UserFriend.findOne({
      userId: currentUserId,
    }).populate({
      path: "friends",
      select: "_id fullName email profilePic",
    });

    // 如果没有记录，返回空数组
    if (!userFriend) {
      return res.status(200).json([]);
    }

    let friends = userFriend.friends;

    // 如果提供了名称搜索参数，进行过滤
    if (fullName) {
      friends = friends.filter((friend) =>
        friend.fullName.toLowerCase().includes(fullName.toLowerCase())
      );
    }

    res.status(200).json(friends);
  } catch (error) {
    console.error("获取好友列表时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};

/**
 * 获取好友请求列表
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 */
export const getFriendRequests = async (req, res) => {
  try {
    const { type } = req.query; // 'sent' 或 'received'
    const currentUserId = req.user._id;

    console.log(`获取好友请求列表 - 用户ID: ${currentUserId}, 类型: ${type}`);

    // 验证类型
    if (!type || !["sent", "received"].includes(type)) {
      console.log(`无效的请求类型: ${type}`);
      return res
        .status(400)
        .json({ message: "请提供有效的类型：sent 或 received" });
    }

    // 获取当前用户的好友关系记录
    let userFriend = await UserFriend.findOne({ userId: currentUserId });

    // 如果没有记录，返回空数组
    if (!userFriend) {
      console.log(`用户没有好友关系记录: ${currentUserId}`);
      return res.status(200).json({ requests: [] });
    }

    const requestIds =
      type === "sent" ? userFriend.sentRequests : userFriend.receivedRequests;

    console.log(
      `请求ID列表: ${JSON.stringify(requestIds)}, 数量: ${requestIds.length}`
    );

    // 获取请求用户的详细信息
    const requests = await User.find({ _id: { $in: requestIds } }).select(
      "_id fullName email profilePic"
    );

    console.log(`找到的用户数量: ${requests.length}`);

    res.status(200).json({
      requests,
    });
  } catch (error) {
    console.error("获取好友请求列表时出错:", error.message);
    res.status(500).json({ message: "服务器内部错误" });
  }
};
