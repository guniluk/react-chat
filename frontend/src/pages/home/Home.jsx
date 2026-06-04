import { useChat } from "../../hooks/useChat";

import Sidebar from "../../components/Sidebar";
import ChatContainer from "../../components/ChatContainer";
import NoChatSelected from "../../components/NoChatSelected";

const Home = () => {
  const {
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
  } = useChat();

  return (
    <div className="flex h-[85vh] md:h-[85vh] w-full max-w-275 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-slate-900/60 text-black dark:text-white shadow-xl dark:shadow-2xl transition-colors duration-300">
      <Sidebar
        users={users}
        onlineUsers={onlineUsers}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        loadingUsers={loadingUsers}
        authUser={authUser}
        handleLogout={handleLogout}
      />

      {selectedConversation ? (
        <ChatContainer
          selectedConversation={selectedConversation}
          onlineUsers={onlineUsers}
          loadingMessages={loadingMessages}
          messages={messages}
          authUser={authUser}
          messageText={messageText}
          setMessageText={setMessageText}
          handleSendMessage={handleSendMessage}
          chatEndRef={chatEndRef}
          setSelectedConversation={setSelectedConversation}
        />
      ) : (
        <NoChatSelected authUser={authUser} />
      )}
    </div>
  );
};

export default Home;
