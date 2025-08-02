import Head from "next/head";

export default function Home() {
  return (
    <>
      <Head>
        <title>Kidly – Smart Book & Video Picks for Kids</title>
        <meta name="description" content="Discover fun, educational books and videos recommended just for your kids!" />
      </Head>

      <main className="bg-white text-gray-800 font-sans">
        {/* Hero */}
        <section className="bg-gradient-to-r from-pink-400 to-yellow-300 py-20 px-6 text-center">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md">
              Discover the Best Books & Videos for Kids
            </h1>
            <p className="text-lg md:text-xl mt-4 text-white">
              Kidly helps parents and teachers find safe, fun, and educational content tailored to children.
            </p>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="bg-white text-pink-600 font-bold px-6 py-3 rounded-full shadow hover:bg-pink-100 transition">
                Explore Recommendations
              </button>
              <button className="bg-yellow-100 text-yellow-800 font-bold px-6 py-3 rounded-full shadow hover:bg-yellow-200 transition">
                How It Works
              </button>
            </div>
          </div>
        </section>

        {/* Video Section */}
        <section className="py-16 px-6 bg-white text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">Watch Kidly in Action</h2>
            <p className="mb-8 text-gray-600">See how Kidly recommends age-appropriate books and videos for your child.</p>
            <div className="aspect-w-16 aspect-h-9 w-full">
              <iframe
                className="w-full h-72 md:h-[480px] rounded-lg shadow-lg"
                src=""
                title="Kidly Demo Video"
                allowFullScreen
              ></iframe>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">Why Parents Love Kidly</h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Age-Appropriate Picks</h3>
                <p>All recommendations are carefully selected based on your child&#39s age and interests.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Educational & Fun</h3>
                <p>Every book and video promotes creativity, learning, and kindness.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-md transition">
                <h3 className="text-xl font-semibold mb-2">Trusted by Parents</h3>
                <p>Built with safety and care, Kidly is loved by thousands of families worldwide.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Reviews Section */}
        <section className="bg-pink-50 py-16 px-6">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">What Parents Are Saying</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <p className="italic mb-3">“Kidly made screen time guilt-free. My son loves the videos, and I love the learning!”</p>
                <p className="font-bold text-sm text-gray-700">– Sarah, mom of 1</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <p className="italic mb-3">“We’ve discovered so many great books. It’s like having a digital librarian at home!”</p>
                <p className="font-bold text-sm text-gray-700">– James, dad of 3</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
                <p className="italic mb-3">“Perfect for teachers! I use Kidly to recommend content to my students every week.”</p>
                <p className="font-bold text-sm text-gray-700">– Ms. Tan, primary school teacher</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-indigo-500 text-white py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Start Exploring with Your Kids Today</h2>
            <p className="mb-6 text-lg">It’s free to get started – no credit card needed.</p>
            <button className="bg-white text-indigo-600 font-semibold px-8 py-3 rounded-full hover:bg-indigo-100 transition">
              Get Started for Free
            </button>
          </div>
        </section>
      </main>
    </>
  );
}
