export const Signup = () => {
  return (
    <div className="flex flex-col items-center justify-center p-6 border border-gray-600 rounded-lg bg-gray-700 text-white">
      <h1 className="text-4xl font-bold text-white mb-4">Sign Up</h1>
      <input
        type="text"
        placeholder="Username"
        className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 bg-gray-700 text-white"
      />
      <input
        type="text"
        placeholder="FullName"
        className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 bg-gray-700 text-white"
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 bg-gray-700 text-white"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full px-4 py-2 mb-4 rounded-lg border border-gray-600 bg-gray-700 text-white"
      />
      <label htmlFor="gender" className="flex items-center gap-2">
        <span className="mr-2">Gender</span>
        <input type="radio" name="gender" id="male" value="male" />
        <span className="mr-2">Male</span>
        <input type="radio" name="gender" id="female" value="female" />
        <span className="mr-2">Female</span>
      </label>
      <button className="w-full px-4 py-3 mt-3 rounded-lg bg-slate-300 text-black font-bold cursor-pointer hover:bg-slate-400 hover:scale-105 transition duration-200">
        Sign Up
      </button>
      <div className="flex mt-4 text-sm">
        <p className="text-gray-400 mr-2">Already have an account?</p>
        <a href="/" className="text-blue-500 hover:underline cursor-pointer">
          Login here
        </a>
      </div>
    </div>
  );
};
