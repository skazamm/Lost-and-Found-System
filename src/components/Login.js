import React, { useState } from "react";

function Login({ setUser, setTab, setMessage, onGuestLogin, API_URL }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const resetForm = () => setForm({ username: "", password: "" });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          usernameOrEmail: form.username,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Login successful!");
        localStorage.setItem("token", data.token);
        // Prefer JWT payload, but fallback to data.user
        const payload = data.user || JSON.parse(atob(data.token.split('.')[1]));
        setUser(payload);
        setTab(payload.role === "admin" ? "admin" : "myreports");
        resetForm();
      } else {
        setMessage(data.error || "Login failed.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
    setLoading(false);
  };

  return (
  <div className="flex justify-center items-center min-h-[340px] w-full bg-gray-100">
    <form
      onSubmit={handleLogin}
      autoComplete="on"
      className="max-w-[600px] w-full bg-white p-10 rounded-xl shadow-xl"
    >
      <input
        type="text"
        name="username"
        placeholder="Username or Email"
        value={form.username}
        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        required
        autoComplete="username"
        className="block w-full mb-4 text-[17px] p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        required
        autoComplete="current-password"
        className="block w-full mb-4 text-[17px] p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <button
        type="submit"
        disabled={loading}
        className={`
          w-full py-2 text-[17px] rounded-md font-semibold
          bg-blue-600 text-white shadow hover:bg-blue-700 transition
          disabled:opacity-70 disabled:cursor-not-allowed
        `}
      >
        {loading ? "Logging in..." : "Login"}
      </button>
      {/* Anonymous login option */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={onGuestLogin}
          disabled={loading}
          className={`
            w-[70%] py-2 text-[16px] rounded-md border font-medium
            bg-amber-400 text-gray-800 border-amber-400
            hover:bg-amber-300 hover:border-amber-300 transition
            mt-1 cursor-pointer
            disabled:opacity-70 disabled:cursor-not-allowed
          `}
        >
          Continue as Guest
        </button>
      </div>
    </form>
  </div>
);

}

export default Login;
