import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import toast from "react-hot-toast";

export const Signup = () => {
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    confirmPassword: "",
    gender: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setAuthUser } = useAuthStore();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Signup failed");
      }
      setAuthUser(data);
      setLoading(false);
      toast.success("Signup successful");
      navigate("/home");
    } catch (err) {
      toast.error(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border border-slate-200 dark:border-slate-700/50 rounded-lg bg-white dark:bg-slate-900/80 text-black dark:text-white w-md mx-auto shadow-xl dark:shadow-2xl transition-colors duration-300">
      <h1 className="text-4xl font-bold text-black dark:text-white mb-4">
        Sign Up <span className="text-blue-600 dark:text-blue-400">Chat App</span>
      </h1>
      {error && <div className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</div>}

      <form onSubmit={handleSignup} className="w-full flex flex-col">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="FullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 mb-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-black dark:text-white focus:outline-none focus:border-blue-500"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />
        <label htmlFor="gender" className="flex items-center gap-2 mb-4 justify-center text-slate-800 dark:text-slate-400 font-semibold text-sm">
          <span className="mr-2">Gender</span>
          <input
            type="radio"
            name="gender"
            id="male"
            value="male"
            className="w-4 h-4 mr-1 cursor-pointer"
            checked={formData.gender === "male"}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          />
          <span className="mr-2 text-black dark:text-slate-300">Male</span>
          <input
            type="radio"
            name="gender"
            id="female"
            value="female"
            className="w-4 h-4 mr-1 cursor-pointer"
            checked={formData.gender === "female"}
            onChange={(e) =>
              setFormData({ ...formData, gender: e.target.value })
            }
          />
          <span className="mr-2 text-black dark:text-slate-300">Female</span>
        </label>
        <button
          className="w-full px-4 py-3 rounded-lg bg-slate-900 dark:bg-slate-300 text-white dark:text-black font-bold cursor-pointer hover:bg-black dark:hover:bg-slate-400 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>

      <div className="flex mt-4 text-sm">
        <p className="text-slate-600 dark:text-slate-400 mr-2">Already have an account?</p>
        <Link to="/" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer">
          Login here
        </Link>
      </div>
    </div>
  );
};
