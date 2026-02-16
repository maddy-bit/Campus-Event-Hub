import React from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Arial",
      }}
    >
      <h2>Login</h2>

      <p>Login page coming soon</p>

      <button
        onClick={() => navigate("/forgot-password")}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
        }}
      >
        Forgot Password?
      </button>
    </div>
  );
}

export default Login;
