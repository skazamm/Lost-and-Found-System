import ReportForm from "./components/ReportForm";
import ViewReports from "./components/ViewReports";
import MyReports from "./components/MyReports";
import AdminDashboard from "./components/AdminDashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Header from './components/Header';
import React, { useState, useEffect } from "react"; // ← Add useEffect here
const API_URL = "http://localhost:5000/api";

function App() {
  const [tab, setTab] = useState("login");
  const [message, setMessage] = useState("");
  const [user, setUser] = useState(null);

   // AUTO-HIDE message after 3 seconds
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(""), 3000); // 3 seconds
    return () => clearTimeout(timer);
  }, [message]);
  
  // ANONYMOUS (GUEST) LOGIN
  const handleGuestLogin = () => {
    setUser({ username: "Guest", role: "guest" });
    setTab("reports"); // Show the main reports view
    setMessage("You are now browsing as a guest.");
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setTab("login");
    setMessage("Logged out.");
  };

  // NAVIGATION BUTTONS
  const renderNav = () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12, width: "100%" }}>
      {user?.role === "admin" ? (
        <button onClick={() => setTab("admin")}>Admin Dashboard</button>
      ) : user?.role === "guest" ? (
        <>
          <button onClick={() => setTab("report")}>Report</button>
          <button onClick={() => setTab("reports")}>View Reports</button>
        </>
      ) : user ? (
        <>
          <button onClick={() => setTab("myreports")}>My Reports</button>
          <button onClick={() => setTab("report")}>Report</button>
          <button onClick={() => setTab("reports")}>View Reports</button>
        </>
      ) : (
        <>
          <button onClick={() => setTab("login")}>Login</button>
          <button onClick={() => setTab("register")}>Register</button>
        </>
      )}
      {user && (
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          <span>
            {user.username} <span style={{ color: "#888" }}>[{user.role}]</span>
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Global Header at the very top */}
      <Header />
      {/* Main app container */}
      <div
        className={`
          ${user && user.role === "admin" ? "max-w-[1300px]" : "max-w-[1100px]"}
          mx-auto mt-10 mb-10 px-8 py-6
          rounded-xl min-h-[280px]
          border border-gray-300
          bg-white shadow-md
        `}
      >
        {/* Navigation */}
        <div className="mb-5">{renderNav()}</div>

        {/* Main content */}
        {!user && tab === "login" ? (
          <Login
            setUser={setUser}
            setTab={setTab}
            setMessage={setMessage}
            onGuestLogin={handleGuestLogin}
            API_URL={API_URL}
          />
        ) : !user && tab === "register" ? (
          <Register
            setTab={setTab}
            setMessage={setMessage}
            API_URL={API_URL}
          />
        ) : user?.role === "admin" && tab === "admin" ? (
          <AdminDashboard />
        ) : user?.role === "guest" && tab === "report" ? (
          <ReportForm user={user} />
        ) : user?.role === "guest" && tab === "reports" ? (
          <ViewReports user={user} />
        ) : user && tab === "myreports" ? (
          <MyReports />
        ) : user && tab === "report" ? (
          <ReportForm user={user} />
        ) : user && tab === "reports" ? (
          <ViewReports user={user} />
        ) : null}

        <div className="mt-4 text-red-600">{message}</div>
      </div>
    </div>
  );
}

export default App;
