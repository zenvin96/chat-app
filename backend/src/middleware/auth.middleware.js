import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

/**
 * 保护路由的中间件
 * 验证用户是否已登录并附加用户信息到请求对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const protectRoute = async (req, res, next) => {
  try {
    // 从cookies中获取JWT令牌
    const token = req.cookies.jwt;

    // 检查令牌是否存在
    if (!token) {
      return res
        .status(401)
        .json({ message: "Unauthorized - No Token Provided" });
    }

    // 验证JWT令牌并解码
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 确保解码成功
    if (!decoded) {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" });
    }

    // 根据解码后的用户ID查找用户，不返回密码字段
    const user = await User.findById(decoded.userId).select("-password");

    // 检查用户是否存在
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 将用户信息附加到请求对象上，供后续路由处理函数使用
    req.user = user;

    // 继续处理下一个中间件或路由处理函数
    next();
  } catch (error) {
    // 记录错误并返回服务器错误响应
    console.log("Error in protectRoute middleware: ", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
};
