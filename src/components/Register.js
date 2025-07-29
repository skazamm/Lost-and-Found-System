import React, { useState } from "react";

function Register({ setTab, setMessage, API_URL }) {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const resetForm = () => setForm({ username: "", email: "", password: "" });

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Registration successful! You can now login.");
        setTab("login");
        resetForm();
      } else {
        setMessage(data.error || "Registration failed.");
      }
    } catch {
      setMessage("Error connecting to server.");
    }
    setLoading(false);
  };

 return (
  <div className="flex justify-center items-center min-h-[420px] w-full bg-gray-100">
    <form
      onSubmit={handleRegister}
      autoComplete="on"
      className="max-w-[600px] w-full bg-white p-10 rounded-xl shadow-xl"
    >
      <input
        type="text"
        name="username"
        placeholder="Username"
        value={form.username}
        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        required
        autoComplete="username"
        className="block w-full mb-4 text-[17px] p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        required
        autoComplete="email"
        className="block w-full mb-4 text-[17px] p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={e => setForm({ ...form, [e.target.name]: e.target.value })}
        required
        autoComplete="new-password"
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
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  </div>
);

}

export default Register;
