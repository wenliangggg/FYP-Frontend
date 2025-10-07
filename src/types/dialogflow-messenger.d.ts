// types/dialogflow-messenger.d.ts
import type * as React from "react";

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "df-messenger": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "project-id": string;
        "agent-id": string;
        location?: string;
        "language-code"?: string;
        "max-query-length"?: string | number;
        "storage-mode"?: "local" | "session" | "none";
        "session-id"?: string;
        "chat-open"?: string | boolean;
        [attr: string]: any;
      };

      "df-messenger-chat-bubble": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        "chat-title"?: string;
        [attr: string]: any;
      };
    }
  }
}

export {};
