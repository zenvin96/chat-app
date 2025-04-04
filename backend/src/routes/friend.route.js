/**
 * 好友关系路由模块 - 处理好友相关的API路由
 */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getFriendRequests,
} from "../controllers/friend.controller.js";

const router = express.Router();

/**
 * 好友关系相关路由
 * 所有路由基于 /api/friends 前缀
 * 所有路由都需要用户身份验证
 */

// 搜索用户
router.get("/search", protectRoute, searchUsers);

// 发送好友请求
router.post("/request", protectRoute, sendFriendRequest);

// 接受好友请求
router.post("/accept", protectRoute, acceptFriendRequest);

// 取消好友请求或移除好友
router.post("/cancel", protectRoute, cancelFriendRequest);

// 获取好友请求列表
router.get("/requests", protectRoute, getFriendRequests);

// 获取好友列表
router.get("/:fullName?", protectRoute, getFriends);

export default router;
