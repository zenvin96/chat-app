import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import cloudinary from "../lib/cloudinary.js";

/**
 * 用户注册控制器
 * @param {Object} req - Express请求对象，包含用户注册信息
 * @param {Object} res - Express响应对象
 * @returns {Object} 包含新用户信息的JSON响应
 */
export const signup = async (req, res) => {
  const { fullName, email, password } = req.body;
  try {
    // 验证所有必填字段是否存在
    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 验证密码长度是否符合要求
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // 检查邮箱是否已被注册
    const user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: "Email already exists" });

    // 对密码进行加密处理
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建新用户对象
    const newUser = new User({
      fullName,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      // 生成JWT令牌并设置到cookie中
      generateToken(newUser._id, res);
      // 保存用户到数据库
      await newUser.save();

      // 返回用户信息（不包含密码）
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * 用户登录控制器
 * @param {Object} req - Express请求对象，包含登录凭证
 * @param {Object} res - Express响应对象
 * @returns {Object} 包含用户信息的JSON响应
 */
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    // 通过邮箱查找用户
    const user = await User.findOne({ email });

    // 如果用户不存在，返回错误
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 验证密码是否正确
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 生成JWT令牌并设置到cookie中
    generateToken(user._id, res);

    // 返回用户信息（不包含密码）
    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * 用户登出控制器
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @returns {Object} 登出成功的消息
 */
export const logout = (req, res) => {
  try {
    // 检查是否是开发环境
    const isDevEnvironment = process.env.NODE_ENV === "development";

    // 通过设置JWT cookie的过期时间为0来清除它
    res.cookie("jwt", "", {
      maxAge: 0,
      httpOnly: true,
      sameSite: isDevEnvironment ? "lax" : "none",
      secure: !isDevEnvironment,
    });
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * 更新用户头像控制器
 * @param {Object} req - Express请求对象，包含头像数据和用户ID
 * @param {Object} res - Express响应对象
 * @returns {Object} 更新后的用户信息
 */
export const updateProfile = async (req, res) => {
  try {
    const { profilePic } = req.body;
    const userId = req.user._id; // 从认证中间件获取的用户ID

    // 验证头像数据是否存在
    if (!profilePic) {
      return res.status(400).json({ message: "Profile pic is required" });
    }

    // 上传图片到Cloudinary云服务
    const uploadResponse = await cloudinary.uploader.upload(profilePic);

    // 更新用户的头像URL
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { profilePic: uploadResponse.secure_url },
      { new: true } // 返回更新后的文档
    );

    res.status(200).json(updatedUser);
  } catch (error) {
    console.log("error in update profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * 检查用户认证状态控制器
 * @param {Object} req - Express请求对象，包含经过认证中间件处理的用户信息
 * @param {Object} res - Express响应对象
 * @returns {Object} 当前认证用户的信息
 */
export const checkAuth = (req, res) => {
  try {
    // 返回从认证中间件中获取的用户信息
    res.status(200).json(req.user);
  } catch (error) {
    console.log("Error in checkAuth controller", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
