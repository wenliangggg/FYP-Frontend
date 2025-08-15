'use client';

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, User } from "firebase/auth";

interface Review {
  id?: string;
  userName: string;
  message: string;
  rating: number;
  createdAt: any;
}

export default function ReviewPage() {
  const [user, setUser] = useState<User | null>(null);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Track logged-in user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch reviews from Firestore
  const fetchReviews = async () => {
    setLoading(true);
    const reviewsRef = collection(db, "reviews");
    const q = query(reviewsRef, orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    const reviewsList = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Review),
    }));
    setReviews(reviewsList);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // Submit a review
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert("You must be logged in to submit a review.");
      return;
    }
    if (rating < 1 || rating > 5) {
      alert("Please select a rating between 1 and 5 stars.");
      return;
    }

    // Fetch user's fullname from 'users' collection
    let userName = "Anonymous";
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        userName = data.fullName || "Anonymous"; // Fetch fullname
      }
    } catch (err) {
      console.error("Error fetching user fullname:", err);
    }

    try {
      await addDoc(collection(db, "reviews"), {
        userName,        // store fullname
        message,
        rating,
        createdAt: serverTimestamp(),
        showOnHome: false 
      });
      setMessage("");
      setRating(0);
      fetchReviews(); // refresh reviews
    } catch (err) {
      console.error("Error adding review:", err);
    }
  };

  const renderStars = (num: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span
          key={i}
          className={`cursor-pointer text-2xl ${i <= num ? "text-pink-600" : "text-gray-300"}`}
        >
          &#9733;
        </span>
      );
    }
    return stars;
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Reviews</h1>
        <p className="text-gray-700 mb-6">
          Share your experience and see what others are saying!
        </p>

        {/* Review Form */}
        {user ? (
          <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-md text-left space-y-4 border border-gray-200 mb-8">
            <div className="flex mb-3">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  className={`cursor-pointer text-2xl ${star <= rating ? "text-pink-600" : "text-gray-300"}`}
                >
                  &#9733;
                </span>
              ))}
            </div>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your review here..."
              className="w-full border border-gray-300 rounded-md p-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-pink-400 focus:border-pink-400"
              required
            />
            <button
              type="submit"
              className="bg-pink-600 text-white font-semibold w-full py-2 rounded-md hover:bg-pink-700 transition"
            >
              Submit Review
            </button>
          </form>
        ) : (
          <p className="text-gray-600 mb-6">Please log in to submit a review.</p>
        )}

        {/* Reviews List */}
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p>No reviews yet. Be the first to review!</p>
        ) : (
          <ul className="space-y-4 text-left">
            {reviews.map((rev) => (
              <li key={rev.id} className="border border-gray-200 p-4 rounded-xl shadow-sm">
                <div className="flex mb-2">{renderStars(rev.rating)}</div>
                <p className="text-gray-800 mb-1">{rev.message}</p>
                <p className="text-sm text-gray-500">
                  By {rev.userName} on {rev.createdAt?.toDate().toLocaleString() || "..."}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
