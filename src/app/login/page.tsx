export default function LoginPage() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Login</h1>
        <p className="text-gray-700 mb-6">Welcome back! Log in to continue exploring.</p>

        <form className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400" placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
            <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400" placeholder="********" />
          </div>
          <button type="submit" className="bg-pink-600 text-white font-semibold w-full py-2 rounded-md hover:bg-pink-700 transition">
            Log In
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600">
          Don’t have an account? <a href="/register" className="text-pink-600 font-semibold hover:underline">Register here</a>.
        </p>
      </div>
    </section>
  );
}
