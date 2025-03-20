/**
 * 群聊路由模块 - 处理群聊相关的路由
 * 包括创建群聊、获取群聊、添加成员和群聊消息
 */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getUserGroups,
  addGroupMembers,
  getGroupMessages,
  sendGroupMessage,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

/**
 * 群聊相关路由
 * 所有路由基于 /api/groups 前缀
 * 所有路由都需要用户身份验证
 */

// 创建新群聊
router.post("/", protectRoute, createGroup);

// 获取用户所有群聊
router.get("/", protectRoute, getUserGroups);

// 添加成员到群聊
router.post("/members", protectRoute, addGroupMembers);

// 离开群聊
router.post("/leave/:groupId", protectRoute, leaveGroup);

// 获取群聊消息历史
router.get("/:groupId/messages", protectRoute, getGroupMessages);

// 发送群聊消息
router.post("/:groupId/messages", protectRoute, sendGroupMessage);

export default router;
