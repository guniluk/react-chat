import { Link } from "react-router-dom";
import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const Login = () => {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthUser } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Login failed");
      }
      setAuthUser(data);
      toast.success("Login successful");
      navigate("/home");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-700/50 rounded-lg bg-white dark:bg-slate-900/80 text-black dark:text-white w-md shadow-xl dark:shadow-2xl transition-colors duration-300">
      <div className="flex mb-6 gap-2 items-center justify-center">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
          Login{" "}
          <span className="text-blue-600 dark:text-blue-400">Chat App</span>
        </h1>
      </div>
      {error && (
        <div className="text-red-500 dark:text-red-400 text-sm mb-4">
          {error}
        </div>
      )}
      <form className="flex flex-col gap-4 w-full" onSubmit={handleLogin}>
        <label
          htmlFor="username"
          className="text-slate-800 dark:text-slate-400 font-semibold text-sm"
        >
          Username
        </label>
        <input
          type="text"
          placeholder="Enter your username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-black dark:text-white bg-white dark:bg-slate-800"
        />
        <label
          htmlFor="password"
          className="text-slate-800 dark:text-slate-400 font-semibold text-sm"
        >
          Password
        </label>
        <input
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:border-blue-500 text-black dark:text-white bg-white dark:bg-slate-800"
        />
        <button
          className="w-full px-4 py-2.5 rounded-lg bg-slate-900 dark:bg-slate-300 text-white dark:text-black font-bold cursor-pointer hover:bg-black dark:hover:bg-slate-400 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div className="flex mt-4">
        <p className="text-slate-600 dark:text-slate-400 ">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};
