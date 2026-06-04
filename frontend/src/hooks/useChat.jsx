import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useConversationStore } from "../store/useConversationStore";
import toast from "react-hot-toast";

// 전역 AudioContext 싱글톤 (매번 생성하여 브라우저 리소스 부족으로 소리가 안 나는 현상 및 메모리 누수 방지)
let audioCtx = null;

// 사용자 인터랙션 시 AudioContext를 활성화하기 위한 전역 핸들러
const initAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
};

// 최초 사용자 인터랙션(클릭, 키보드 입력) 감지 시 오디오 컨텍스트 락 해제
if (typeof window !== "undefined") {
  const unlockAudio = () => {
    initAudioContext();
    window.removeEventListener("click", unlockAudio);
    window.removeEventListener("keydown", unlockAudio);
  };
  window.addEventListener("click", unlockAudio);
  window.addEventListener("keydown", unlockAudio);
}

// 알림음 재생 함수 (Web Audio API를 활용하여 오프라인 및 외부 차단 상태에서도 동작)
const playNotificationSound = () => {
  try {
    initAudioContext();
    if (!audioCtx) return;

    const ctx = audioCtx;

    // 첫 번째 음 (D5)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime);
    gain1.gain.setValueAtTime(0, ctx.currentTime);
    gain1.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // 두 번째 음 (A5, 0.08초 딜레이)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(880.00, ctx.currentTime + 0.08);
    gain2.gain.setValueAtTime(0, ctx.currentTime + 0.08);
    gain2.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.10);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.15);

    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.28);
  } catch (e) {
    console.error("Audio play failed", e);
  }
};


export const useChat = () => {
  const [users, setUsers] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const { authUser, setAuthUser, onlineUsers, socket } = useAuthStore();
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
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      // 1. 현재 선택한 유저가 보낸 메시지인 경우 -> 대화창에 즉시 추가 및 사운드 재생
      if (selectedConversation?._id === newMessage.senderId) {
        setMessages([...messages, newMessage]);
        playNotificationSound();
      } else {
        // 2. 다른 유저가 보낸 메시지인 경우 -> 알림(Toast) 표시 및 클릭 시 대화창 이동
        const sender = users.find((u) => u._id === newMessage.senderId);
        const senderName = sender ? sender.fullName : "새로운 메시지";
        const senderPic =
          sender?.profilePic ||
          `https://api.dicebear.com/9.x/avataaars/svg?seed=${sender?.username || "default"}`;

        // 알림음 재생 (Web Audio API)
        playNotificationSound();

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
                  <div className="relative shrink-0">
                    <img
                      className="w-10 h-10 rounded-full ring-2 ring-blue-500/20"
                      src={senderPic}
                      alt={senderName}
                    />
                    <span className="absolute bottom-0 right-0 block w-3 h-3 bg-green-500 border-2 border-white rounded-full dark:border-slate-900" />
                  </div>
                  <div className="flex-1 min-w-0 ml-3">
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
                  className="flex items-center justify-center w-full px-4 py-2 text-xs font-bold text-red-500 transition-colors border border-transparent rounded-none rounded-r-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 focus:outline-none"
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

  return {
    users,
    loadingUsers,
    messages,
    loadingMessages,
    messageText,
    setMessageText,
    handleSendMessage,
    chatEndRef,
    handleLogout,
    authUser,
    onlineUsers,
    selectedConversation,
    setSelectedConversation,
  };
};
