import React from "react";

function Header() {
  return (
    <header
      className="flex items-center gap-4 px-7"
      style={{
        background: "linear-gradient(135deg, #2563eb 0%, #fbbf24 100%)",
        minHeight: 80,
        boxShadow:
          "0 6px 32px 0 rgba(37, 99, 235, 0.12), 0 1px 0 0 #fff6",
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        paddingTop: 18,
        paddingBottom: 18,
        borderBottom: "1.5px solid #e0e5ef",
      }}
    >
      <img
        src="/lost-and-found.png"
        alt="Lost & Found Logo"
        style={{
          width: 56,
          height: 56,
          objectFit: "contain",
          marginRight: 18,
          background: "rgba(255,255,255,0.7)",
          borderRadius: 12,
          boxShadow: "0 3px 16px rgba(31, 41, 55, 0.13)",
        }}
      />
      <span
        className="font-bold"
        style={{
          fontSize: 26,
          letterSpacing: "0.5px",
          color: "#f5f5fa",
          textShadow: "0 1px 4px #1b293a18",
        }}
      >
        Lost &amp; Found System
      </span>
    </header>
  );
}

export default Header;
