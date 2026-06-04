import { useState } from "react";
import { FiSearch, FiLogOut } from "react-icons/fi";

const Sidebar = ({
  users,
  onlineUsers,
  selectedConversation,
  setSelectedConversation,
  loadingUsers,
  authUser,
  handleLogout,
}) => {
  const [search, setSearch] = useState("");

  // 검색어로 필터링
  const filteredUsers = users.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={`w-full md:w-80 md:flex flex-col transition-colors duration-300 border-r border-slate-200 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/40 ${selectedConversation ? "hidden" : "flex"}`}>
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
            className="flex-1 px-4 py-2 text-sm text-black transition-colors bg-white border rounded-xl border-slate-300 dark:border-slate-600/50 dark:bg-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <button
            type="button"
            className="p-2 text-white transition-colors bg-blue-600 cursor-pointer rounded-xl hover:bg-blue-500"
          >
            <FiSearch className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* 중단 나를 제외한 유저들의 리스트 */}
      <div className="flex-1 p-2 space-y-1 overflow-y-auto custom-scrollbar">
        {loadingUsers ? (
          <div className="flex items-center justify-center h-32">
            <span className="text-blue-500 loading loading-spinner loading-md"></span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="mt-8 text-sm text-center text-slate-500">
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
                <div className="relative avatar">
                  <div className="w-10 h-10 overflow-hidden rounded-full ring-2 ring-slate-200 dark:ring-slate-700/50">
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
                  <p className="text-sm font-semibold text-black truncate dark:text-slate-200">
                    {user.fullName}
                  </p>
                  <p className="text-xs truncate text-slate-700 dark:text-slate-400">
                    @{user.username}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 하단 로그아웃 영역 */}
      <div className="flex items-center justify-between p-4 transition-colors duration-300 border-t border-slate-200 dark:border-slate-700/30 bg-slate-100 dark:bg-slate-950/20">
        <div className="flex items-center gap-2">
          <div className="relative avatar">
            <div className="w-8 h-8 overflow-hidden rounded-full ring-1 ring-slate-300 dark:ring-slate-600">
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
            <div className="block">
              <p className="text-xs font-semibold text-black truncate dark:text-slate-200 max-w-40">
              {authUser?.fullName}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="p-2 transition-all cursor-pointer rounded-xl text-slate-800 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/10"
          title="Logout"
        >
          <FiLogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
