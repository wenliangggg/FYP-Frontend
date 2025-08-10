import { FaBook, FaVideo, FaRobot } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";

export default function LandingPage() {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="text-center py-20 px-6 bg-pink-50">
        <h1 className="text-5xl font-bold text-pink-600 mb-4">
          Welcome to KidFlix
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto mb-6">
          Fun, safe, and smart recommendations for kids! Discover books, videos,
          and stories picked just for your little ones.
        </p>
        <a
          href="/register"
          className="bg-pink-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-pink-700 transition"
        >
          Get Started Free
        </a>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-16 px-6 grid md:grid-cols-4 gap-8 text-center">
        <div>
          <FaBook className="text-pink-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg block text-sm font-semibold text-gray-800 mb-2">Curated Books</h3>
          <p className="text-gray-900">
            Hand-picked reading for every age group, from toddlers to teens.
          </p>
        </div>
        <div>
          <FaVideo className="text-pink-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg block text-sm font-semibold text-gray-800 mb-2">Kid-Friendly Videos</h3>
          <p className="text-gray-900">
            Educational and entertaining videos to keep kids engaged.
          </p>
        </div>
        <div>
          <FaRobot className="text-pink-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg block text-sm font-semibold text-gray-800 mb-2">Smart Chatbot</h3>
          <p className="text-gray-900">
            Ask our kid-safe AI for book and video suggestions anytime.
          </p>
        </div>
        <div>
          <MdSecurity className="text-pink-600 text-4xl mx-auto mb-4" />
          <h3 className="text-lg block text-sm font-semibold text-gray-800 mb-2">Safe & Secure</h3>
          <p className="text-gray-900">
            Fully moderated and parent-approved recommendations.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-pink-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">
          How It Works
        </h2>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-pink-600 text-white w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
              1
            </div>
            <h4 className="block text-sm font-semibold text-gray-800 mb-2">Sign Up</h4>
            <p className="text-gray-900">
              Create a free account in minutes.
            </p>
          </div>
          <div>
            <div className="bg-pink-600 text-white w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
              2
            </div>
            <h4 className="block text-sm font-semibold text-gray-800 mb-2">Tell Us Your Interests</h4>
            <p className="text-gray-900">
              Select your child’s age and favorite topics.
            </p>
          </div>
          <div>
            <div className="bg-pink-600 text-white w-12 h-12 flex items-center justify-center rounded-full mx-auto mb-4">
              3
            </div>
            <h4 className="block text-sm font-semibold text-gray-800 mb-2">Enjoy Recommendations</h4>
            <p className="text-gray-900">
              Get tailored book and video suggestions instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-3xl font-bold text-center text-pink-600 mb-10">
          What Parents Say
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl shadow text-center">
            <p className="text-gray-700 italic">
              “KidFlix has made finding safe content so easy! My kids love it.”
            </p>
            <p className="mt-4 font-semibold">– Sarah L.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow text-center">
            <p className="text-gray-700 italic">
              “Finally, a platform I can trust for my children’s media.”
            </p>
            <p className="mt-4 font-semibold">– Daniel R.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow text-center">
            <p className="text-gray-700 italic">
              “My kids ask the chatbot for new stories every day!”
            </p>
            <p className="mt-4 font-semibold">– Maria K.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-pink-600 text-white text-center py-6 mt-10">
        <p>© 2025 KidFlix. All rights reserved.</p>
        <div className="mt-2 space-x-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Service</a>
        </div>
      </footer>
    </main>
  );
}
