import type { Metadata } from "next";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KidFlix",
  description: "Discover books and educational videos for kids",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Dialogflow Messenger bootstrap */}
        <Script
          src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"
          strategy="afterInteractive"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Navbar />
        <main>{children}</main>
        <Footer />

        {/* Dialogflow Messenger widget */}
        <df-messenger
          intent="WELCOME"
          chat-title="kidflix-bot"
          agent-id="80aba165-ba45-424b-a08b-530cfed40536"
          language-code="en"
        />
      </body>
    </html>
  );
}
