import { io } from "socket.io-client";

// Backend origin, without /api/v1
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

// Creates (but does not connect) a socket authenticated with the stored JWT.
export function createSocket() {
    return io(SOCKET_URL, {
        autoConnect: false,
        auth: {
            token: sessionStorage.getItem("token"),
        },
    });
}
