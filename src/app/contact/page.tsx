export default function ContactPage() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-pink-600 mb-6">Contact Us</h1>
        <p className="text-gray-700 mb-8">Have questions or feedback? We&#39d love to hear from you!</p>

        <form className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Name</label>
            <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400" placeholder="Your name" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
            <input type="email" className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400" placeholder="your@email.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-1">Message</label>
            <textarea className="w-full px-4 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-pink-400 focus:border-pink-400" rows="4" placeholder="Type your message..." />
          </div>
          <button type="submit" className="bg-pink-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-pink-700 transition">
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
