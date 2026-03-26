import { useState, useContext } from "react";
import { useNavigate } from "react-router";
import { login, getFirebaseAuth } from "~/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function meta() {
  return [
    { title: "Login - Plain Flags" },
    { name: "description", content: "Sign in to Plain Flags" },
  ];
}

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(email, password);

      // Force token refresh to get latest custom claims if any
      await user.getIdToken(true);

      // Fetch the user's role from the management API
      const token = await user.getIdToken();
      const managementUrl = window.ENV?.MANAGEMENT_SERVICE_URL;

      let role = "user";
      try {
        const res = await fetch(`${managementUrl}/api/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          // We have admin access — determine role from the email match
          const users: Array<{ id: string; email: string; role: string }> =
            await res.json();
          const me = users.find((u) => u.email === user.email);
          if (me) role = me.role;
        }
      } catch {
        // Non-admin users won't have access to /api/users — that's fine
      }

      // Also try fetching flags to verify we're provisioned
      const flagsRes = await fetch(`${managementUrl}/api/flags`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (flagsRes.status === 403) {
        setError(
          "Your account is not yet provisioned. Please contact an administrator.",
        );
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        localStorage.setItem("email", user.email || "");
        localStorage.setItem("role", role);
      }

      navigate("/flags");
    } catch (err: any) {
      const code = err?.code;
      if (
        code === "auth/user-not-found" ||
        code === "auth/wrong-password" ||
        code === "auth/invalid-credential"
      ) {
        setError("Invalid email or password.");
      } else {
        setError(err?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gray-800 w-screen h-screen flex justify-center items-center">
      <div className="flex flex-col items-center min-h-52 bg-gray-100 rounded p-8 mb-40 w-80">
        <img src="/images/logo.svg" alt="logo" className="w-12 h-12" />
        <h1 className="my-3 font-bold uppercase text-gray-500">Plain Flags</h1>
        <div className="h-1 w-full rounded bg-black/5 m-2"></div>
        <h1 className="text-xs mb-3 text-gray-400">welcome, please log in</h1>

        <form className="flex flex-col w-full gap-2" onSubmit={handleSubmit}>
          <input
            className="p-2 text-gray-600 font-semibold text-sm border-2 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="email"
            placeholder="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            className="p-2 text-gray-600 font-semibold text-sm border-2 rounded focus:border-current focus:ring-0 placeholder-gray-400"
            type="password"
            placeholder="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && (
            <p className="text-red-500 text-xs font-semibold">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2 px-4 bg-green-600 text-white font-bold rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
