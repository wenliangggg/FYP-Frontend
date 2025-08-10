export default function ContactPage() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-pink-600 mb-4">Contact Us</h1>
        <p className="text-gray-700 text-lg mb-12">
          We’d love to hear from you! Whether you have a question, feedback, or just want to say hi — our team is here to help.
        </p>

        {/* Contact Info */}
        <div className="bg-pink-50 p-8 rounded-xl shadow-sm mb-12">
          <h2 className="text-2xl font-semibold text-pink-600 mb-3">Get in Touch</h2>
          <p className="text-gray-700">📧 Email: <a href="mailto:support@kidflix.com" className="text-pink-500 hover:underline">support@kidflix.com</a></p>
          <p className="text-gray-700">📞 Phone: <a href="tel:+65 8989 1511" className="text-pink-500 hover:underline">+65 8989 1511</a></p>
          <p className="text-gray-700">🏢 Address: 123 KidFlix Lane, Fun City, 00000</p>
        </div>

        {/* Contact Form */}
        <form className="bg-white p-8 rounded-xl shadow-md border border-gray-200 max-w-2xl mx-auto text-left">
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Name</label>
            <input
              type="text"
              placeholder="Your name"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 placeholder-gray-300 focus:ring-pink-400"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              placeholder="Your email"
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 placeholder-gray-300 focus:ring-pink-400"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Message</label>
            <textarea
              placeholder="Write your message..."
              rows={5}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 placeholder-gray-300 focus:ring-pink-400"
            ></textarea>
          </div>
          <button
            type="submit"
            className="bg-pink-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-pink-700 transition"
          >
            Send Message
          </button>
        </form>
      </div>
    </section>
  );
}
