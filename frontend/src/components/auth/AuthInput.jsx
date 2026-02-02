import React from "react";

const AuthInput = ({ type, placeholder, value, onChange }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-3 rounded-lg bg-[#1a1a1a] outline-none border border-gray-700 focus:border-green-600 text-sm"
    />
  );
};

export default AuthInput;
