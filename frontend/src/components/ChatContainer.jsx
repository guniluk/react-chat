import { FiMessageSquare, FiSend, FiArrowLeft } from "react-icons/fi";

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
}) => {
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
                  ? "bg-green-500 animate-pulse"
                  : "bg-slate-400"
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
            <p className="text-sm">
              Say hello to start the conversation!
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMyMessage = msg.senderId === authUser?._id;
            const messageTime = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div
                key={msg._id}
                className={`flex gap-3 max-w-[75%] ${
                  isMyMessage ? "ml-auto flex-row-reverse" : "mr-auto"
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
                        ? "bg-blue-600 text-white rounded-br-none"
                        : "bg-slate-200 dark:bg-slate-700 text-black dark:text-slate-100 rounded-bl-none"
                    }`}
                  >
                    {msg.message}
                  </div>
                  <span
                    className={`text-[10px] text-slate-700 dark:text-slate-500 mt-1 ${
                      isMyMessage ? "text-right" : "text-left"
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
        <form onSubmit={handleSendMessage} className="flex gap-2">
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
