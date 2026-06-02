import { Link } from 'react-router-dom';

export const Login = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-gray-600 rounded-lg bg-gray-700 text-white">
      <div className="flex mb-6 gap-2 items-center justify-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Login <span className="text-blue-400">Chat App</span>
        </h1>
      </div>
      <form className="flex flex-col gap-4 w-[400px]">
        <label htmlFor="username" className="text-gray-400">
          Username
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400 text-white"
        />
        <label htmlFor="password" className="text-gray-400">
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 focus:outline-none focus:border-blue-400 text-white"
        />
        <button className="w-full px-4 py-2 rounded-lg bg-slate-300 text-black font-bold cursor-pointer hover:bg-slate-400 hover:scale-105 transition duration-200">
          Login
        </button>
      </form>
      <div className="flex mt-4">
        <p className="text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 cursor-pointer">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
