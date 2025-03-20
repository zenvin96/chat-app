/**
 * 认证路由模块 - 处理用户认证相关的路由
 * 包括注册、登录、登出、更新个人资料和验证身份
 */
import express from "express";
import {
  checkAuth,
  login,
  logout,
  signup,
  updateProfile,
} from "../controllers/auth.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

/**
 * 认证相关路由
 * 所有路由基于 /api/auth 前缀
 */

// 公开路由 - 不需要身份验证
router.post("/signup", signup); // 用户注册
router.post("/login", login); // 用户登录
router.post("/logout", logout); // 用户登出

// 受保护路由 - 需要身份验证
router.put("/update-profile", protectRoute, updateProfile); // 更新用户资料

// 验证用户身份的路由
router.get("/check", protectRoute, checkAuth); // 验证用户是否已登录

export default router;
