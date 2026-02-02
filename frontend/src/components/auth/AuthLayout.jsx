import React from "react";

const AuthLayout = ({ title, children }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-[#0f0f0f] p-8 rounded-2xl border border-gray-800">
        <h1 className="text-2xl font-semibold text-center mb-6">{title}</h1>
        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
