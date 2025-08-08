export default function AboutPage() {
  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-pink-600">About KidFlix</h1>
        <p className="text-lg text-gray-700 mb-6">
          KidFlix is a smart recommendation platform that helps parents and teachers discover the best books and videos for children.
          Whether it’s story time or screen time, we ensure the content is safe, fun, and educational.
        </p>

        <div className="bg-pink-50 p-6 md:p-10 rounded-xl shadow text-left">
          <h2 className="text-2xl font-semibold text-pink-500 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            We believe in fostering curiosity, creativity, and kindness through age-appropriate media.
            With KidFlix, families and educators can trust that every recommendation supports healthy development.
          </p>

          <h2 className="text-2xl font-semibold text-pink-500 mb-4 mt-6">Why We Built KidFlix</h2>
          <p className="text-gray-700">
            Choosing the right content for children shouldn&#39t be overwhelming. KidFlix uses simple filters and smart suggestions 
            to take the guesswork out of discovering amazing books and videos for every stage of childhood.
          </p>
        </div>
      </div>
    </section>
  );
}
