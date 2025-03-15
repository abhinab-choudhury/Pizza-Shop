import { Key, User } from 'lucide-react';
import { Link } from 'react-router-dom';

function Login() {
  return (
    <div className="min-h-screen border-y-1 flex items-center justify-center px-4">
      <div className="p-16 rounded-xl w-full max-w-md">
        <h2 className="text-2xl font-semibold text-gray-800 text-center">Welcome Back</h2>
        <p className="text-sm text-gray-600 text-center mt-2">
          Enter your details to login to you account
        </p>

        <form className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600">Name</label>
            <div className="relative mt-1">
              <User
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Enter your name"
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600">Password</label>
            <div className="relative mt-1">
              <Key
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="password"
                placeholder="Enter your password"
                className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
              />
            </div>
          </div>

          <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
            Sign Up
          </button>
        </form>

        <p className="text-sm text-gray-600 text-center mt-4">
          Don&apos;t have an account?
          <Link to="/auth/register" className="text-blue-500 font-medium ml-1">
            Register Now!!
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
