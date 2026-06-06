import { useState, useEffect, useRef } from 'react';
import {
  FiMessageSquare,
  FiSend,
  FiArrowLeft,
  FiImage,
  FiX,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

const ChatContainer = ({
  selectedConversation,
  onlineUsers,
  loadingMessages,
  messages,
  authUser,
  messageText,
  setMessageText,
  handleSendMessage,
  chatEndRef,
  setSelectedConversation,
  selectedImage,
  setSelectedImage,
}) => {
  const [shakingMessageId, setShakingMessageId] = useState(null);
  const fileInputRef = useRef(null);
  const prevLength = useRef(0);
  const isFirstLoad = useRef(true);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      toast.error('이미지 크기는 1MB를 초과할 수 없습니다.');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  useEffect(() => {
    if (loadingMessages) {
      isFirstLoad.current = true;
      return;
    }

    if (isFirstLoad.current) {
      prevLength.current = messages.length;
      isFirstLoad.current = false;
      return;
    }

    if (messages.length > prevLength.current) {
      const lastMessage = messages[messages.length - 1];
      // 마지막 메시지가 상대방이 보낸 메시지(수신 메시지)일 때만 shake 적용
      if (lastMessage && lastMessage.senderId !== authUser?._id) {
        const setShake = () => {
          setShakingMessageId(lastMessage._id);
        };
        setShake();
        const timer = setTimeout(() => setShakingMessageId(null), 2000);
        prevLength.current = messages.length;
        return () => clearTimeout(timer);
      }
    }

    prevLength.current = messages.length;
  }, [messages, loadingMessages, authUser?._id]);

  return (
    <div className="flex flex-col flex-1 transition-colors duration-300 bg-white dark:bg-slate-950/30">
      {/* 우상단 헤더 */}
      <div className="flex items-center justify-between px-4 md:px-6 py-4 transition-colors duration-300 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30">
        <div className="flex items-center gap-3">
          {/* 뒤로가기 버튼 (모바일용) */}
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors cursor-pointer text-slate-800 dark:text-slate-200 mr-1"
            title="Back to list"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div className="relative avatar">
            <div className="overflow-hidden rounded-full w-9 h-9 ring-2 ring-blue-500/20">
              <img
                src={
                  selectedConversation.profilePic ||
                  `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation.username}`
                }
                alt={selectedConversation.fullName}
              />
            </div>
            {/* 실시간 상태 뱃지 */}
            <span
              className={`absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 ${
                onlineUsers?.includes(selectedConversation._id)
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-slate-400'
              }`}
            />
          </div>
          <div>
            <span className="text-xs font-semibold tracking-wide text-blue-600 dark:text-blue-400">
              TO:
            </span>
            <h2 className="text-sm md:text-base font-bold text-black dark:text-slate-200 leading-none mt-0.5">
              {selectedConversation.fullName}
            </h2>
          </div>
        </div>
      </div>

      {/* 대화 내용 영역 */}
      <div className="flex-1 p-4 md:p-6 space-y-4 overflow-y-auto custom-scrollbar">
        {loadingMessages ? (
          <div className="flex items-center justify-center h-full">
            <span className="text-blue-500 loading loading-spinner loading-lg"></span>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-500">
            <FiMessageSquare className="w-12 h-12 mb-2 text-slate-400 dark:text-slate-600 animate-pulse" />
            <p className="text-sm">Say hello to start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.senderId === authUser?._id;
            const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });
            return (
              <div
                key={msg._id}
                className={`flex gap-3 max-w-[75%] ${
                  isMyMessage ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* 유저 이미지 */}
                <img
                  src={
                    isMyMessage
                      ? authUser?.profilePic ||
                        `https://api.dicebear.com/9.x/avataaars/svg?seed=${authUser?.username}`
                      : selectedConversation?.profilePic ||
                        `https://api.dicebear.com/9.x/avataaars/svg?seed=${selectedConversation?.username}`
                  }
                  alt="Avatar"
                  className="self-end w-8 h-8 mb-1 rounded-full ring-1 ring-slate-200 dark:ring-slate-700/50"
                />
                {/* 대화 내용 및 시간 */}
                <div className="flex flex-col">
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm shadow-md font-medium break-all whitespace-pre-wrap ${
                      isMyMessage
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-200 dark:bg-slate-700 text-black dark:text-slate-100 rounded-bl-none'
                    } ${msg._id === shakingMessageId ? 'animate-shake' : ''}`}
                  >
                    {msg.messageFile && (
                      <img
                        src={msg.messageFile}
                        alt="Attachment"
                        className="max-w-62.5 md:max-w-[320px] rounded-lg mb-2 shadow-sm border border-slate-200 dark:border-slate-700/50"
                      />
                    )}
                    {msg.message && <p>{msg.message}</p>}
                  </div>
                  <span
                    className={`text-[10px] text-slate-700 dark:text-slate-500 mt-1 ${
                      isMyMessage ? 'text-right' : 'text-left'
                    }`}
                  >
                    {messageTime}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={chatEndRef} />
      </div>

      {/* 하단 입력 영역 */}
      <div className="p-3 md:p-4 transition-colors duration-300 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30">
        {selectedImage && (
          <div className="flex items-center gap-2 mb-3 bg-slate-100 dark:bg-slate-800/50 p-2 rounded-xl w-fit relative group">
            <img
              src={selectedImage}
              alt="Preview"
              className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-1.5 -right-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full p-0.5 shadow-md transition-colors"
            >
              <FiX className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />

          <button
            type="button"
            className={`flex items-center justify-center p-3 text-slate-500 dark:text-slate-400 transition-colors bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700/50 cursor-pointer rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 ${
              selectedImage ? 'text-blue-500 border-blue-500' : ''
            }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <FiImage className="w-5 h-5" />
          </button>

          <input
            type="text"
            placeholder="Type a message..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            className="flex-1 px-5 py-3 text-sm text-black transition-colors bg-white border rounded-2xl border-slate-300 dark:border-slate-700/50 dark:bg-slate-800/80 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="flex items-center justify-center p-3 text-white transition-colors bg-blue-600 cursor-pointer rounded-2xl hover:bg-blue-500"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatContainer;
