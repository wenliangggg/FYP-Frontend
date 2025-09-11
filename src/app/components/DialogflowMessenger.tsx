"use client";

import { useEffect } from "react";
import Script from "next/script";

export default function DialogflowMessenger() {
  useEffect(() => {
    // You could add extra setup logic here if needed later
  }, []);

  return (
    <>
      {/* Load Dialogflow Messenger script */}
      <Script
        src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"
        strategy="afterInteractive"
      />

      {/* Inject the custom element without TS complaints */}
      <div
        dangerouslySetInnerHTML={{
          __html: `
            <df-messenger
              intent="WELCOME"
              chat-title="kidflix-bot"
              agent-id="80aba165-ba45-424b-a08b-530cfed40536"
              language-code="en">
            </df-messenger>
          `,
        }}
      />
    </>
  );
}
