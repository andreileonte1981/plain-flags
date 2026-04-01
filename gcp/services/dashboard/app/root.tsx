import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useState } from "react";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { CurrentFlagContext } from "~/context/currentFlagContext";
import { CurrentConstraintContext } from "~/context/currentConstraintContext";
import { ToastContext, ToastMessage } from "~/context/toastContext";
import Toast from "~/ui/components/toast";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
  { rel: "stylesheet", href: stylesheet },
];

declare global {
  interface Window {
    ENV?: {
      MANAGEMENT_SERVICE_URL?: string;
      FIREBASE_CONFIG?: string;
    };
  }
}

export function Layout({ children }: { children: React.ReactNode }) {
  const firebaseConfig =
    typeof process !== "undefined"
      ? JSON.stringify({
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN,
          projectId: process.env.FIREBASE_PROJECT_ID,
          appId: process.env.FIREBASE_APP_ID,
        })
      : "{}";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {typeof document === "undefined" ? (
          <script
            dangerouslySetInnerHTML={{
              __html: `window.ENV = ${JSON.stringify({
                MANAGEMENT_SERVICE_URL: process.env.MANAGEMENT_SERVICE_URL,
                FIREBASE_CONFIG: firebaseConfig,
              })};`,
            }}
          />
        ) : null}
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  const [currentFlag, setCurrentFlag] = useState("");
  const [currentConstraint, setCurrentConstraint] = useState("");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function queueToast(message: string) {
    const id = `toast_${Math.random() * 100_000_000}`;
    const toast = new ToastMessage(message, id);
    setToasts((prev) => [...prev, toast]);
    setTimeout(() => removeToast(id), ToastMessage.delay);
  }

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  return (
    <ToastContext.Provider value={{ queueToast, removeToast }}>
      <CurrentFlagContext.Provider value={{ currentFlag, setCurrentFlag }}>
        <CurrentConstraintContext.Provider
          value={{ currentConstraint, setCurrentConstraint }}
        >
          <Outlet />
          <Toast messages={toasts} removeToast={removeToast} />
        </CurrentConstraintContext.Provider>
      </CurrentFlagContext.Provider>
    </ToastContext.Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="container mx-auto p-4 pt-16">
      <h1 className="mb-2">{message}</h1>
      <p className="mb-4">{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto bg-gray-100">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
