/**
 * Socket.IO模块 - 实时通信服务
 * 负责处理用户在线状态和实时消息推送
 */
import { Server } from "socket.io";
import http from "http";
import express from "express";

// 创建Express应用
const app = express();
// 创建HTTP服务器
const server = http.createServer(app);

/**
 * 创建Socket.IO服务器实例
 * 配置跨域选项，允许前端应用连接
 */
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.0.8:5173"], // 允许前端开发服务器连接
  },
});

/**
 * 根据用户ID获取对应的Socket ID
 * 用于向特定用户发送实时消息
 *
 * @param {string} userId - 用户ID
 * @returns {string|undefined} 用户的Socket ID，如果用户不在线则为undefined
 */
export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// 用户在线状态映射表
const userSocketMap = {}; // {userId: socketId}

/**
 * 处理Socket连接事件
 * 管理用户在线状态和断开连接
 */
io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;

    // 为每个用户创建一个专属房间，更容易发送针对性消息
    socket.join(`user_${userId}`);
  }

  // 向所有客户端广播在线用户列表
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // 加入群聊房间
  socket.on("joinGroup", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  // 离开群聊房间
  socket.on("leaveGroup", (groupId) => {
    socket.leave(`group_${groupId}`);
  });

  // 处理用户断开连接
  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    // 重新广播更新后的在线用户列表
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
