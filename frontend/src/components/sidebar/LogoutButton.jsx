import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import socket from "../../socket";

const LogoutButton = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    socket.disconnect();
    logout();
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="w-full text-left text-red-400 text-sm p-3 hover:bg-[#1a1a1a]"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
