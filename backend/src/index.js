/**
 * 主入口文件 - 聊天应用后端服务器
 * 配置Express服务器，中间件，路由和套接字连接
 */
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import { connectDB } from "./lib/db.js";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import groupRoutes from "./routes/group.route.js";
import { app, server } from "./lib/socket.js";

// 加载环境变量
dotenv.config();

const PORT = process.env.PORT;
const __dirname = path.resolve();

// 配置中间件
// 增加请求体大小限制，允许上传更大的图片（最大50MB）
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser()); // 解析cookies
app.use(
  cors({
    origin: ["http://localhost:5173", "http://192.168.0.8:5173"], // 前端开发服务器地址
    credentials: true, // 允许跨域请求携带凭证(cookies)
  })
);

// 注册API路由
app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/groups", groupRoutes);

// 生产环境静态文件服务配置
if (process.env.NODE_ENV === "production") {
  // 提供前端构建文件作为静态资源
  app.use(express.static(path.join(__dirname, "../frontend/dist")));

  // 所有非API路由都返回前端应用
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
  });
}

// 启动服务器并连接数据库
server.listen(PORT, () => {
  console.log("server is running on PORT:" + PORT);
  connectDB();
});
