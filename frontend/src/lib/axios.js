import axios from "axios";

// 获取当前主机名
const currentHost = window.location.hostname;

// 设置baseURL根据不同环境
let baseURL;
if (import.meta.env.MODE === "development") {
  // 开发环境下，如果是从192.168.0.8访问，使用对应的API地址
  if (currentHost === "192.168.0.8") {
    baseURL = "http://192.168.0.8:5001/api";
  } else {
    baseURL = "http://localhost:5001/api";
  }
} else {
  // 生产环境下使用相对路径
  baseURL = "/api";
}

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});
