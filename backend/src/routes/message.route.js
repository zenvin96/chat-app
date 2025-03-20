/**
 * 消息路由模块 - 处理聊天消息相关的路由
 * 包括获取消息列表、发送消息和获取用户列表
 */
import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.controller.js";

const router = express.Router();

/**
 * 消息相关路由
 * 所有路由基于 /api/messages 前缀
 * 所有路由都需要用户身份验证
 */

// 获取侧边栏用户列表 - 展示所有可聊天的用户
router.get("/users", protectRoute, getUsersForSidebar);

// 获取与特定用户的聊天历史 - :id为聊天对象的用户ID
router.get("/:id", protectRoute, getMessages);

// 向特定用户发送消息 - :id为接收消息的用户ID
router.post("/send/:id", protectRoute, sendMessage);

export default router;
