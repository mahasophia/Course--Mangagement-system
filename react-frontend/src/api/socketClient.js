
import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL ||
  "https://course-mangagement-system-1.onrender.com";

export function createSocket() {
  const token =
    sessionStorage.getItem("token") ||
    localStorage.getItem("token");

  return io(SOCKET_URL, {
    autoConnect: false,
    auth: {
      token,
    },
    transports: ["polling", "websocket"],
  });
}
