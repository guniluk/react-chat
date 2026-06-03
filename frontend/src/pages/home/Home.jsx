import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import { useConversationStore } from "../../store/useConversationStore";
import toast from "react-hot-toast";

const Home = () => {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [messageText, setMessageText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { authUser, setAuthUser, onlineUsers } = useAuthStore();
  const {
    selectedConversation,
    setSelectedConversation,
    messages,
    setMessages,
  } = useConversationStore();

  const chatEndRef = useRef(null);

  // 자동 스크롤
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 유저 목록 가져오기
  useEffect(() => {
    const getUsers = async () => {
      setLoadingUsers(true);
      try {
        const res = await fetch("/api/users");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setUsers(data);
      } catch (err) {
        console.error("Failed to load users:", err.message);
      } finally {
        setLoadingUsers(false);
      }
    };
    getUsers();
  }, []);

  // 메시지 가져오기
  useEffect(() => {
    if (!selectedConversation?._id) return;
    const getMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await fetch(`/api/messages/${selectedConversation._id}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data);
      } catch (err) {
        console.error("Failed to load messages:", err.message);
      } finally {
        setLoadingMessages(false);
      }
    };
    getMessages();
  }, [selectedConversation?._id, setMessages]);

  // 메시지 전송
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    try {
      const res = await fetch(
        `/api/messages/send/${selectedConversation._id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: messageText }),
        },
      );
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages([...messages, data]);
      setMessageText("");
    } catch (err) {
      console.error("Failed to send message:", err.message);
    }
  };

  // 실시간 메시지 수신 및 알림 처리
  const { socket } = useAuthStore();
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // 1. 현재 선택한 유저가 보낸 메시지인 경우 -> 대화창에 즉시 추가
      if (selectedConversation?._id === newMessage.senderId) {
        setMessages([...messages, newMessage]);
      } else {
        // 2. 다른 유저가 보낸 메시지인 경우 -> 알림(Toast) 표시 및 클릭 시 대화창 이동
        const sender = users.find((u) => u._id === newMessage.senderId);
        const senderName = sender ? sender.fullName : "새로운 메시지";
        const senderPic =
          sender?.profilePic ||
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${sender?.username || "default"}`;

        // 알림음 재생 (프리미엄 효과)
        try {
          const audio = new Audio(
            "https://assets.mixkit.co/active_storage/sfx/2357/2357-84.wav",
          );
          audio.volume = 0.4;
          audio.play();
        } catch (e) {
          console.error("Audio play failed", e);
        }

        toast.custom(
          (t) => (
            <div
              onClick={() => {
                if (sender) {
                  setSelectedConversation(sender);
                }
                toast.dismiss(t.id);
              }}
              className={`${
                t.visible ? "animate-bounce-in" : "animate-fade-out"
              } max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl`}
            >
              <div className="flex-1 w-0 p-4">
                <div className="flex items-center">
                  <div className="shrink-0 relative">
                    <img
                      className="h-10 w-10 rounded-full ring-2 ring-blue-500/20"
                      src={senderPic}
                      alt={senderName}
                    />
                    <span className="absolute bottom-0 right-0 block w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 bg-green-500" />
                  </div>
                  <div className="ml-3 flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                      {senderName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
                      {newMessage.message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex border-l border-slate-100 dark:border-slate-800/80">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.dismiss(t.id);
                  }}
                  className="w-full border border-transparent rounded-none rounded-r-2xl px-4 py-2 flex items-center justify-center text-xs font-bold text-red-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none"
                >
                  닫기
                </button>
              </div>
            </div>
          ),
          { duration: Infinity },
        );
      }
    };

    socket.on("newMessage", handleNewMessage);

    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  }, [
    socket,
    selectedConversation?._id,
    messages,
    setMessages,
    users,
    setSelectedConversation,
  ]);

  // 로그아웃
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setAuthUser(null);
      setSelectedConversation(null);
    } catch (err) {
      console.error("Failed to logout:", err.message);
    }
  };

  // 검색어로 필터링
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex h-[85vh] w-full max-w-275 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/60 text-black dark:text-white shadow-xl dark:shadow-2xl transition-colors duration-300">
      {/* 1. 왼쪽 사이드바 */}
      <div className="w-1/3 md:w-80 border-r border-slate-200 dark:border-slate-700/50 flex flex-col bg-slate-50 dark:bg-slate-900/40 transition-colors duration-300">
        {/* 상단 검색 영역 */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-700/30">
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Search user..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-600/50 bg-white dark:bg-slate-800 text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              type="button"
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.604 10.604Z"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* 중단 나를 제외한 유저들의 리스트 */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
          {loadingUsers ? (
            <div className="flex justify-center items-center h-32">
              <span className="loading loading-spinner loading-md text-blue-500"></span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center text-slate-500 text-sm mt-8">
              No users found
            </p>
          ) : (
            filteredUsers.map((user) => {
              const isSelected = selectedConversation?._id === user._id;
              return (
                <div
                  key={user._id}
                  onClick={() => setSelectedConversation(user)}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? "bg-blue-50 dark:bg-blue-600/20 border border-blue-500/20 dark:border-blue-500/30"
                      : "border border-transparent hover:bg-slate-200 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div className="avatar relative">
                    <div className="w-10 h-10 rounded-full ring-2 ring-slate-200 dark:ring-slate-700/50 overflow-hidden">
                      <img
                        src={
                          user.profilePic ||
                          `https://api.dicebear.com/9.x/avataaars/svg?seed=${user.username}`
                        }
                        alt={user.fullName}
                      />
                    </div>
                    {/* 실시간 상태 뱃지 */}
                    <span
                      className={`absolute bottom-0.5 right-0.5 block w-3 h-3 rounded-full border-2 border-white dark:border-slate-900 ${
                        onlineUsers?.includes(user._id)
                          ? "bg-green-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-black dark:text-slate-200 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-slate-700 dark:text-slate-400 truncate">
                      @{user.username}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 하단 로그아웃 영역 */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-700/30 bg-slate-100 dark:bg-slate-950/20 flex items-center justify-between transition-colors duration-300">
          <div className="flex items-center gap-2">
            <div className="avatar relative">
              <div className="w-8 h-8 rounded-full ring-1 ring-slate-300 dark:ring-slate-600 overflow-hidden">
                <img
                  src={
                    authUser?.profilePic ||
                    `https://api.dicebear.com/9.x/avataaars/svg?seed=${authUser?.username}`
                  }
                  alt="My Avatar"
                />
              </div>
              {/* 내 상태 뱃지 (항상 온라인 상태이므로 bg-green-500) */}
              <span className="absolute bottom-0 right-0 block w-2.5 h-2.5 rounded-full border border-white dark:border-slate-900 bg-green-500 animate-pulse" />
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-semibold text-black dark:text-slate-200 max-w-30 truncate">
                {authUser?.fullName}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl text-slate-800 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Logout"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* 2. 오른쪽 채팅 메인 컨테이너 */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950/30 transition-colors duration-300">
        {selectedConversation ? (
          <>
            {/* 우상단 헤더 */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30 flex items-center justify-between transition-colors duration-300">
              <div className="flex items-center gap-3">
                <div className="avatar relative">
                  <div className="w-9 h-9 rounded-full ring-2 ring-blue-500/20 overflow-hidden">
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
                  <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold tracking-wide">
                    TO:
                  </span>
                  <h2 className="text-sm md:text-base font-bold text-black dark:text-slate-200 leading-none mt-0.5">
                    {selectedConversation.fullName}
                  </h2>
                </div>
              </div>
            </div>

            {/* 대화 내용 영역 */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 dark:text-slate-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-12 h-12 mb-2 text-slate-400 dark:text-slate-600 animate-pulse"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a.75.75 0 0 1-1.074-.765 6 6 0 0 0 1.228-3.41C4.469 15.343 4 13.723 4 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
                    />
                  </svg>
                  <p className="text-sm">
                    Say hello to start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isMyMessage = msg.senderId === authUser?._id;
                  const messageTime = new Date(
                    msg.createdAt,
                  ).toLocaleTimeString([], {
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
                        className="w-8 h-8 rounded-full self-end mb-1 ring-1 ring-slate-200 dark:ring-slate-700/50"
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
            <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/30 transition-colors duration-300">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1 px-5 py-3 text-sm rounded-2xl border border-slate-300 dark:border-slate-700/50 bg-white dark:bg-slate-800/80 text-black dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="submit"
                  className="p-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer flex items-center justify-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5 rotate-45 transform -translate-x-0.5 translate-y-0.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </>
        ) : (
          /* 대화 상대가 선택되지 않은 초기 화면 */
          <div className="flex-1 flex flex-col items-center justify-center text-slate-800 dark:text-slate-500 p-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 flex items-center justify-center mb-4 ring-1 ring-slate-200 dark:ring-slate-700/50 shadow-lg">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-8 h-8 text-blue-500"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M20.25 8.511c.083.185.195.37.3.55a.75.75 0 0 1-1.173.931 7.218 7.218 0 0 0-1.162-1.077.75.75 0 0 1-.08-1.053c.12-.138.252-.267.397-.385a.75.75 0 1 1 .97 1.139 7.273 7.273 0 0 0-.252.895ZM1.5 12a10.5 10.5 0 1 1 21 0 10.5 10.5 0 0 1-21 0Zm12.5-3a2 2 0 1 0-4 0 2 2 0 0 0 4 0Zm-4.5 9h5v-1a2.5 2.5 0 0 0-2.5-2.5h0A2.5 2.5 0 0 0 9.5 17v1Z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-black dark:text-slate-200 mb-1">
              Welcome, {authUser?.fullName}!
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-500">
              Select a conversation from the sidebar to start messaging.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
