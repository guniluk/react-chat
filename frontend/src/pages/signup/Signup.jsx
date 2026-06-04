import { Link } from "react-router-dom";
import { useSignup } from "../../hooks/useSignup";

export const Signup = () => {
  const { formData, setFormData, loading, error, handleSignup } = useSignup();

  return (
    <div className="flex flex-col items-center justify-center p-6 mx-auto text-black transition-colors duration-300 bg-white border rounded-lg shadow-xl border-slate-200 dark:border-slate-700/50 dark:bg-slate-900/80 dark:text-white w-md dark:shadow-2xl">
      <h1 className="mb-4 text-4xl font-bold text-black dark:text-white">
        Sign Up{" "}
        <span className="text-blue-600 dark:text-blue-400">Chat App</span>
      </h1>
      {error && (
        <div className="mb-4 text-sm text-red-500 dark:text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSignup} className="flex flex-col w-full">
        <input
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 text-black bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="text"
          placeholder="FullName"
          value={formData.fullName}
          onChange={(e) =>
            setFormData({ ...formData, fullName: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 text-black bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className="w-full px-4 py-2 mb-4 text-black bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Confirm Password"
          className="w-full px-4 py-2 mb-4 text-black bg-white border rounded-lg border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-blue-500"
          value={formData.confirmPassword}
          onChange={(e) =>
            setFormData({ ...formData, confirmPassword: e.target.value })
          }
        />
        <label
          htmlFor="gender"
          className="flex items-center justify-center gap-2 mb-4 text-sm font-semibold text-slate-800 dark:text-slate-400"
        >
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
        <p className="mr-2 text-slate-600 dark:text-slate-400">
          Already have an account?
        </p>
        <Link
          to="/login"
          className="font-semibold text-blue-600 cursor-pointer dark:text-blue-400 hover:underline"
        >
          Login here
        </Link>
      </div>
    </div>
  );
};
