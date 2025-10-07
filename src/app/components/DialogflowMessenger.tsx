"use client";

<<<<<<< HEAD
import Script from "next/script";
import React from "react";

// Prevent duplicates across HMR/StrictMode
declare global {
  // eslint-disable-next-line no-var
  var __DF_WIDGET_ADDED__: boolean | undefined;
}

// Tiny wrapper avoids TS IntrinsicElements typing issues
const DFMessenger = (props: any) => React.createElement("df-messenger", props);

export default function DialogflowMessenger() {
  const [scriptReady, setScriptReady] = React.useState(false);
  const [canMount, setCanMount] = React.useState(false);
  const [shouldWelcome, setShouldWelcome] = React.useState(false);

  // Mount exactly once per page lifetime
  React.useEffect(() => {
    if (!globalThis.__DF_WIDGET_ADDED__) {
      globalThis.__DF_WIDGET_ADDED__ = true;
      setCanMount(true);
    }
  }, []);

  // Greet only once per tab
  React.useEffect(() => {
    const KEY = "df_has_welcomed";
    if (!sessionStorage.getItem(KEY)) {
      setShouldWelcome(true);
      sessionStorage.setItem(KEY, "1");
    }
=======
import React from "react";
import Script from "next/script";

// Render custom elements without JSX typing friction
const DFMessenger = (props: any) => React.createElement("df-messenger", props);
const DFBubble    = (props: any) => React.createElement("df-messenger-chat-bubble", props);

function newSessionId() {
  return `kidflix-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function clearDfStorage() {
  try {
    for (const store of [localStorage, sessionStorage]) {
      Object.keys(store).forEach((k) => {
        const kk = k.toLowerCase();
        if (kk.includes("df") || kk.includes("dialogflow")) store.removeItem(k);
      });
    }
  } catch {}
}

export default function DialogflowMessenger() {
  const [ready, setReady] = React.useState(false);
  const [sessionId, setSessionId] = React.useState<string | null>(null);

  const projectId = process.env.NEXT_PUBLIC_DF_PROJECT_ID!;
  const agentId   = process.env.NEXT_PUBLIC_DF_AGENT_ID!;
  const location  = process.env.NEXT_PUBLIC_DF_LOCATION || "asia-southeast1";
  const chatTitle = process.env.NEXT_PUBLIC_CHAT_TITLE || "Kidflix Assistant";

  React.useEffect(() => {
    const KEY = "kidflix_df_session_id";
    let sid = sessionStorage.getItem(KEY);
    if (!sid) {
      sid = newSessionId();
      sessionStorage.setItem(KEY, sid);
    }
    setSessionId(sid);
    (window as any).resetKidflixChat = () => {
      clearDfStorage();
      const fresh = newSessionId();
      sessionStorage.setItem(KEY, fresh);
      setSessionId(fresh);
    };
>>>>>>> chatbot-integration
  }, []);

  return (
    <>
<<<<<<< HEAD
      <Script
        id="df-bootstrap"
        src="https://www.gstatic.com/dialogflow-console/fast/messenger/bootstrap.js?v=1"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />

      {scriptReady && canMount && (
        <DFMessenger
          {...(shouldWelcome ? { intent: "WELCOME" } : {})}
          chat-title="kidflix-bot"
          agent-id="80aba165-ba45-424b-a08b-530cfed40536"
          language-code="en"
        />
=======
      {/* 1) Trusted Types shim — must run BEFORE df-messenger.js */}
      <Script id="tt-shim" strategy="beforeInteractive">{`
        (function(w){
          // If trustedTypes isn't present or is a stub without createPolicy, provide one.
          var tt = w.trustedTypes;
          if (!tt || typeof tt.createPolicy !== 'function') {
            w.trustedTypes = {
              createPolicy: function (_name, rules) {
                return {
                  createHTML:     rules && rules.createHTML     ? rules.createHTML     : function(s){ return s; },
                  createScript:   rules && rules.createScript   ? rules.createScript   : function(s){ return s; },
                  createScriptURL:rules && rules.createScriptURL? rules.createScriptURL: function(s){ return s; }
                };
              }
            };
          } else {
            // Some environments polyfill createPolicy but return an object missing createScriptURL.
            try {
              var p = tt.createPolicy('df-messenger-probe', { createScriptURL: function(s){ return s; } });
              if (!p || typeof p.createScriptURL !== 'function') {
                // Patch createPolicy to always return the expected shape
                var orig = tt.createPolicy;
                w.trustedTypes.createPolicy = function(name, rules) {
                  var r = orig.call(tt, name, rules || {});
                  return {
                    createHTML:     r.createHTML     || (rules && rules.createHTML)      || function(s){ return s; },
                    createScript:   r.createScript   || (rules && rules.createScript)    || function(s){ return s; },
                    createScriptURL:r.createScriptURL|| (rules && rules.createScriptURL) || function(s){ return s; }
                  };
                };
              }
            } catch (e) {
              // If calling createPolicy throws due to CSP, provide a no-op policy to satisfy callers.
              w.trustedTypes.createPolicy = function(_name, rules){
                return {
                  createHTML:     rules && rules.createHTML     ? rules.createHTML     : function(s){ return s; },
                  createScript:   rules && rules.createScript   ? rules.createScript   : function(s){ return s; },
                  createScriptURL:rules && rules.createScriptURL? rules.createScriptURL: function(s){ return s; }
                };
              };
            }
          }
        })(window);
      `}</Script>

      {/* 2) Messenger CSS + script */}
      <link
        rel="stylesheet"
        href="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/themes/df-messenger-default.css"
      />
      <Script
        src="https://www.gstatic.com/dialogflow-console/fast/df-messenger/prod/v1/df-messenger.js"
        strategy="afterInteractive"
        onLoad={() => {
          setReady(true);
          window.addEventListener("dfMessengerError", (e: any) => {
            console.error("DF-MESSENGER error", e?.detail || e);
          });
        }}
      />

      {/* 3) Widget */}
      {ready && sessionId && (
        <DFMessenger
          {...{
            location,
            "project-id": projectId,
            "agent-id": agentId,
            "language-code": "en",
            "max-query-length": "-1",
            "storage-mode": "none",
            "session-id": sessionId,
            // uncomment this to auto-open and verify it's alive:
            // "chat-open": "true",
            style: {
              position: "fixed",
              bottom: 16,
              right: 16,
              zIndex: 2147483647,
            },
          }}
        >
          <DFBubble {...{ "chat-title": chatTitle }} />
        </DFMessenger>
>>>>>>> chatbot-integration
      )}
    </>
  );
}
