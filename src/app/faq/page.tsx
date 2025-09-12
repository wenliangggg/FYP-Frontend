// src/app/faq/page.tsx
"use client";

import { useState } from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "What is KidFlix?",
    answer:
      "KidFlix is a platform where kids and parents can discover books and educational videos, and get personalized recommendations using our integrated chatbot.",
  },
  {
    question: "Who can use KidFlix?",
    answer:
      "KidFlix is designed for kids, parents, and teachers. You’ll need an account to access personalized features.",
  },
  {
    question: "Is KidFlix free to use?",
    answer:
      "Yes! You can explore books and videos for free. However, some advanced features require creating an account and subscribing to one of our plans.",
  },
  {
    question: "Do I need an account to explore books and videos?",
    answer:
      "You can browse freely, but you’ll need to log in to save favorites, leave reviews, and receive chatbot recommendations.",
  },
  {
    question: "How does the KidFlix chatbot work?",
    answer:
      "Our chatbot helps you discover books and videos tailored to your age, interests, or topics you ask about.",
  },
  {
    question: "Is KidFlix safe for kids?",
    answer:
      "Yes. All content is curated to be age-appropriate and your personal information is protected with strict privacy controls.",
  },
  {
    question: "I forgot my password. What should I do?",
    answer:
      "Click on 'Forgot Password' on the login page to reset your password via email.",
  },
  {
    question: "How do I contact KidFlix support?",
    answer:
      "You can reach us through the Contact page.",
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-white py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-pink-600 text-center mb-10">
          Frequently Asked Questions
        </h1>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm bg-gray-50"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-4 text-left font-semibold text-gray-800 hover:text-pink-600"
              >
                {faq.question}
                <span className="text-pink-600 text-xl">
                  {openIndex === index ? "−" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
