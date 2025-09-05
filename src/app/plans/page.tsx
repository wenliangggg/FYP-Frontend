'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  isFree?: boolean;
}

export default function SubscriptionPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  // Fetch plans from Firestore
  const fetchPlans = async () => {
    const snapshot = await getDocs(collection(db, "plans"));
    const plansList: Plan[] = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<Plan, "id">),
    }));
    setPlans(plansList);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push("/login");
        return;
      }

      setUser(currentUser);

      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);

      let currentPlanName = "Free Plan"; // default

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.plan) {
          currentPlanName = userData.plan;
        } else {
          await updateDoc(userRef, { plan: "Free Plan" }).catch(async () => {
            await setDoc(userRef, { plan: "Free Plan" }, { merge: true });
          });
        }
      } else {
        await setDoc(userRef, { plan: "Free Plan" });
      }

      await fetchPlans();

      setPlans((prev) => {
        // find the plan object that matches the user's plan name
        const validPlan = prev.find((p) => p.name === currentPlanName);
        setSelectedPlan(validPlan || null);
        return prev;
      });

      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSelectPlan = async (plan: Plan) => {
    if (!user) return;
    setSelectedPlan(plan);

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { plan: plan.name }).catch(async () => {
      await setDoc(userRef, { plan: plan.name }, { merge: true });
    });

    if (plan.isFree) {
      alert(`You are now on the ${plan.name}`);
    }
  };

  const handleCheckout = () => {
    if (!selectedPlan) return;
    // ✅ send plan.id, not plan.name
    router.push(`/checkout?plan=${encodeURIComponent(selectedPlan.id)}`);
  };

  if (loading) return <p className="text-center py-20">Loading...</p>;

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <h1 className="text-4xl font-bold text-pink-600 mb-6">Choose Your Plan</h1>
        <p className="text-gray-700 mb-12">
          Select the subscription plan that fits your needs and enjoy safe, curated content for your kids.
        </p>

        <div className="grid md:grid-cols-4 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative p-8 rounded-2xl shadow-lg border transition-transform duration-300 ${
                selectedPlan?.id === plan.id
                  ? "border-pink-600 scale-[1.03]"
                  : "border-gray-200 hover:scale-[1.02]"
              }`}
            >
              <h2 className="text-2xl font-bold text-pink-600 mb-4">{plan.name}</h2>
              <p className="text-gray-900 text-xl font-semibold mb-6">$ {plan.price}</p>

              <ul className="text-gray-700 mb-6 space-y-2">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-center">
                    <span className="mr-2 text-pink-600">✔</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan(plan)}
                className={`w-full py-2 rounded-md font-semibold transition ${
                  selectedPlan?.id === plan.id
                    ? "bg-pink-700 text-white"
                    : "bg-pink-600 text-white hover:bg-pink-700"
                }`}
              >
                {selectedPlan?.id === plan.id ? "Selected" : "Select Plan"}
              </button>
            </div>
          ))}
        </div>

        {/* Checkout only for paid plans */}
        {selectedPlan && !selectedPlan.isFree && (
          <div className="mt-10">
            <button
              onClick={handleCheckout}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
