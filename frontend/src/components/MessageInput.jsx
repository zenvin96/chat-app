import { useRef, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { Image, Send, X, Smile } from "lucide-react";
import toast from "react-hot-toast";
import EmojiPicker from "emoji-picker-react";

// 支持通过props接收自定义发送消息处理函数
const MessageInput = ({ onSendMessage }) => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef(null);

  // 如果没有提供自定义处理函数，则使用默认的发送私聊消息函数
  const { sendMessage } = useChatStore();
  const handleSendMessageFn = onSendMessage || sendMessage;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
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

  const handleEmojiClick = (emojiData) => {
    setText((prevText) => prevText + emojiData.emoji);
    setShowEmojiPicker(false); // 选择表情后关闭选择器
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() && !imagePreview) return;

    try {
      await handleSendMessageFn({
        text: text.trim(),
        image: imagePreview,
      });

      // Clear form
      setText("");
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (error) {
      console.error("发送消息失败:", error);
    }
  };

  return (
    <div className="p-4 w-full">
      {imagePreview && (
        <div className="mb-3 flex items-center gap-2">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-20 h-20 object-cover rounded-lg border border-zinc-700"
            />
            <button
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-base-300
              flex items-center justify-center"
              type="button"
            >
              <X className="size-3" />
            </button>
          </div>
        </div>
      )}

      {showEmojiPicker && (
        <div className="absolute bottom-20 right-4 z-10">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={300}
            height={400}
            theme="dark"
          />
        </div>
      )}

      <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
        {["😊", "😂", "❤️", "👍", "🎉", "🔥", "🤔", "😍"].map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setText((prev) => prev + emoji)}
            className="btn btn-xs btn-ghost"
          >
            {emoji}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSendMessage}
        className="flex items-center gap-2 relative"
      >
        <div className="flex-1 flex gap-2">
          <input
            type="text"
            className="w-full input input-bordered rounded-lg input-sm sm:input-md"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className="hidden sm:flex btn btn-circle text-zinc-400"
            onClick={toggleEmojiPicker}
          >
            <Smile size={20} />
          </button>

          <button
            type="button"
            className={`hidden sm:flex btn btn-circle
                     ${imagePreview ? "text-emerald-500" : "text-zinc-400"}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <Image size={20} />
          </button>
        </div>
        <button
          type="submit"
          className="btn btn-sm btn-circle"
          disabled={!text.trim() && !imagePreview}
        >
          <Send size={22} />
        </button>
      </form>
    </div>
  );
};
export default MessageInput;
