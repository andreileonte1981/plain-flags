import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import stylesheet from "./app.css?url";
import { ModalContext, type ModalIconType } from "./context/modalContext";
import { useState } from "react";
import Modal from "./ui/components/reusables/modal";
import { CurrentFlagContext } from "./context/currentFlagContext";
import { CurrentConstraintContext } from "./context/currentConstraintContext";
import { ToastContext, ToastMessage } from "./context/toastContext";
import Toast from "./ui/components/reusables/toast";

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

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
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

  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("Harrow (-_-)");
  const [iconType, setIconType] = useState("error");

  function showMessage(s: string, icon: ModalIconType = "error") {
    setMessage(s);
    setIsOpen(true);
    setIconType(icon);
  }

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  function queueToast(s: string) {
    const toastId = `toastId_${Math.random() * 100000000}`;
    const message = new ToastMessage(s, toastId);

    setToasts((prevoasts) => {
      return [...prevoasts, message];
    });

    setTimeout(() => {
      removeToast(toastId);
    }, ToastMessage.delay);
  }

  function removeToast(id: string) {
    setToasts((prevToasts) => {
      return prevToasts.filter((t) => t.id !== id);
    });
  }

  return (
    <ModalContext.Provider value={{ showMessage }}>
      <ToastContext.Provider value={{ queueToast, removeToast }}>
        <CurrentFlagContext.Provider value={{ currentFlag, setCurrentFlag }}>
          <CurrentConstraintContext.Provider
            value={{ currentConstraint, setCurrentConstraint }}
          >
            <>
              <Outlet />
              <div id="main"></div>
              <Toast messages={toasts} removeToast={removeToast}></Toast>
              <Modal
                isOpen={isOpen}
                setIsOpen={setIsOpen}
                message={message}
                setMessage={setMessage}
                iconType={iconType as ModalIconType}
              ></Modal>
            </>
          </CurrentConstraintContext.Provider>
        </CurrentFlagContext.Provider>
      </ToastContext.Provider>
    </ModalContext.Provider>
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
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
