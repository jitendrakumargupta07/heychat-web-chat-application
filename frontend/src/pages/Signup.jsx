import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/auth.api";
import AuthLayout from "../components/auth/AuthLayout";
import AuthInput from "../components/auth/AuthInput";

const Signup = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      setError("");

      await signupUser({ name, email, password });

      // ✅ redirect to login page (OLD behavior)
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create HeyChat Account">
      <div className="space-y-4">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <AuthInput value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
        <AuthInput value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" />
        <AuthInput type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
        <AuthInput type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm Password" />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 py-3 rounded-lg"
        >
          {loading ? "Creating..." : "Signup"}
        </button>
      </div>
    </AuthLayout>
  );
};

export default Signup;
