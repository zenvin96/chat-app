/**
 * 工具函数模块
 * 提供通用功能函数，如JWT令牌生成等
 */
import jwt from "jsonwebtoken";

/**
 * 生成JWT认证令牌并设置到HTTP Cookie
 *
 * @param {string} userId - 用户ID，将被编码到令牌中
 * @param {Object} res - Express响应对象，用于设置cookie
 * @returns {string} 生成的JWT令牌
 */
export const generateToken = (userId, res) => {
  // 创建包含用户ID的JWT令牌，设置7天过期时间
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  // 检查是否是开发环境
  const isDevEnvironment = process.env.NODE_ENV === "development";

  // 设置HTTP-only cookie，包含JWT令牌
  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7天过期时间(毫秒)
    httpOnly: true, // 防止XSS攻击(跨站脚本攻击)，JavaScript无法访问cookie
    sameSite: isDevEnvironment ? "lax" : "none", // 开发环境使用lax，生产环境使用none
    secure: !isDevEnvironment, // 开发环境中禁用secure标志
  });

  return token;
};
