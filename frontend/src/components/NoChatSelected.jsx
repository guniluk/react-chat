import { FiUser } from "react-icons/fi";

const NoChatSelected = ({ authUser }) => {
  return (
    <div className="hidden md:flex flex-col items-center justify-center flex-1 p-8 text-slate-800 dark:text-slate-500">
      <div className="flex items-center justify-center w-16 h-16 mb-4 border shadow-lg rounded-2xl bg-slate-100 dark:bg-slate-800/80 border-slate-200/50 dark:border-slate-700/50 ring-1 ring-slate-200 dark:ring-slate-700/50">
        <FiUser className="w-8 h-8 text-blue-500" />
      </div>
      <h2 className="mb-1 text-xl font-bold text-black dark:text-slate-200">
        Welcome, {authUser?.fullName}!
      </h2>
      <p className="text-sm text-slate-600 dark:text-slate-500">
        Select a conversation from the sidebar to start messaging.
      </p>
    </div>
  );
};

export default NoChatSelected;
