import { jwtDecode } from "jwt-decode";

export const getLoggedInUser = () => {
  try {
    const token = localStorage.getItem("jwtToken");
    if (!token) return null;

    const decoded = jwtDecode(token);
    return decoded;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
};
