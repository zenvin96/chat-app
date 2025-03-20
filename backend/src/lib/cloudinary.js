/**
 * Cloudinary配置模块
 * 配置Cloudinary云服务用于图片和媒体存储
 * 用于处理用户头像和聊天中的图片上传
 */
import { v2 as cloudinary } from "cloudinary";
import { config } from "dotenv";

// 确保环境变量已加载
config();

/**
 * 使用环境变量配置Cloudinary SDK
 * 需要在.env文件中设置以下变量:
 * - CLOUDINARY_CLOUD_NAME: Cloudinary云名称
 * - CLOUDINARY_API_KEY: Cloudinary API密钥
 * - CLOUDINARY_API_SECRET: Cloudinary API密钥secret
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 导出配置好的cloudinary实例
export default cloudinary;
