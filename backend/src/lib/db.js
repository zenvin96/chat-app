/**
 * 数据库连接模块
 * 负责建立与MongoDB数据库的连接
 */
import mongoose from "mongoose";

/**
 * 连接MongoDB数据库
 *
 * 使用环境变量中的MONGODB_URI连接字符串
 * 成功连接后会在控制台显示连接信息
 * 连接失败会在控制台显示错误信息
 *
 * @returns {Promise<void>} 连接过程的Promise
 */
export const connectDB = async () => {
  try {
    // 尝试连接到MongoDB数据库
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // 处理连接错误
    console.log("MongoDB connection error:", error);
  }
};
