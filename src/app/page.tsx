'use client';

import Footer from "./components/Footer";
import { where } from "firebase/firestore";
import { FaBook, FaVideo, FaRobot } from "react-icons/fa";
import { MdSecurity } from "react-icons/md";
import { useState, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface Review {
  id?: string;
  userName: string;
  message: string;
  rating: number;
  createdAt: any;
}

export default function LandingPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(db, "reviews");
      const q = query(
        reviewsRef,
        where("showOnHome", "==", true)
      );
      const snapshot = await getDocs(q);
      const reviewsList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Review),
      }));
      setReviews(reviewsList);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  // Auto-slide if more than 3 reviews
  useEffect(() => {
    if (reviews.length > 3) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
      }, 3000); // change every 3s
      return () => clearInterval(interval);
    }
  }, [reviews]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const visibleReviews =
    reviews.length > 3
      ? [
          reviews[currentIndex],
          reviews[(currentIndex + 1) % reviews.length],
          reviews[(currentIndex + 2) % reviews.length],
        ]
      : reviews;

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

{/* Testimonials Section */}
      <section className="max-w-6xl mx-auto py-16 px-6">
        <h2 className="text-4xl font-extrabold text-center text-pink-600 mb-12 tracking-tight">
          What Parents Say
        </h2>

        {reviews.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            No reviews yet. Be the first to share your experience! 💬
          </p>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 transition-all duration-500">
            {visibleReviews.map((rev) => (
              <div
                key={rev.id}
                className="relative p-6 bg-white rounded-2xl shadow-lg border border-pink-100 hover:shadow-2xl hover:scale-[1.02] transition-transform duration-300"
              >
                <div className="absolute -top-4 -left-4 text-pink-200 text-6xl">
                  “
                </div>
                <p className="text-gray-700 italic text-lg leading-relaxed">
                  {rev.message}
                </p>
                <div className="mt-6 flex flex-col items-center">
                  <p className="text-gray-900 font-semibold text-lg">{rev.userName}</p>
                  <div className="flex mt-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        fill={index < rev.rating ? "gold" : "none"}
                        viewBox="0 0 24 24"
                        stroke="gold"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.071 5.281a.563.563 0 00.475.345l5.641.411c.54.04.757.73.364 1.093l-4.29 3.73a.563.563 0 00-.182.557l1.285 5.573c.12.522-.454.93-.91.643l-4.9-3.023a.563.563 0 00-.586 0l-4.9 3.023c-.456.287-1.03-.121-.91-.643l1.285-5.573a.563.563 0 00-.182-.557l-4.29-3.73c-.393-.363-.176-1.053.364-1.093l5.641-.411a.563.563 0 00.475-.345l2.071-5.281z"
                        />
                      </svg>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <Footer />
    </main>
  );
}
