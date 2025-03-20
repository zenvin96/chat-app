import { useState, useRef } from "react";
import { Image, Send } from "lucide-react";
import { useChatStore } from "../store/useChatStore";
import toast from "react-hot-toast";

const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);

  // 如果没有提供自定义处理函数，则使用默认的发送私聊消息函数
  const { sendMessage } = useChatStore();
  const handleSendMessageFn = onSendMessage || sendMessage;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("请选择图片文件");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await handleSendMessageFn({
        text: text.trim(),
        image: imagePreview,
      });

      // 清除表单
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return (
    <div className="border-t border-base-300 p-2 sm:p-3">
      {/* 图片预览 */}
      {imagePreview && (
        <div className="relative mb-2 inline-block">
          <img
            src={imagePreview}
            alt="Preview"
            className="max-h-32 rounded-md object-contain"
          />
          <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 bg-error text-white rounded-full size-6 flex items-center justify-center"
          >
            &times;
          </button>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost"
          onClick={() => fileInputRef.current?.click()}
        >
          <Image size={18} />
        </button>

        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageChange}
        />

        <input
          type="text"
          className="flex-1 input input-bordered rounded-full input-sm"
          placeholder="发送消息..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button
          type="submit"
          className="btn btn-sm btn-circle btn-primary"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
