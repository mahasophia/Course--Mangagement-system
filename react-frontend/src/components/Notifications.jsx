import { useEffect, useState } from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socketClient";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        let active = true;

        apiClient
            .get("/notifications")
            .then((response) => {
                if (active) {
                    setNotifications(response.data.notifications);
                }
            })
            .catch(() => {
                if (active) setError("Unable to load notifications");
            });

        // Live notifications pushed by the server
        const socket = createSocket();
        socket.on("new_notification", (notification) => {
            setNotifications((previous) => [notification, ...previous]);
        });
        socket.connect();

        return () => {
            active = false;
            socket.disconnect();
        };
    }, []);

    async function markRead(id) {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications((previous) =>
                previous.map((item) =>
                    item._id === id ? { ...item, isRead: true } : item
                )
            );
        } catch {
            setError("Unable to update notification");
        }
    }

    return (
        <section>
            <h2>Notifications</h2>
            {error && (
                <p role="alert" style={{ color: "crimson" }}>
                    {error}
                </p>
            )}
            {notifications.length === 0 && <p>No notifications yet.</p>}
            {notifications.map((item) => (
                <div key={item._id} style={{ marginBottom: "8px" }}>
                    <p style={{ fontWeight: item.isRead ? "normal" : "bold" }}>
                        {item.message}
                    </p>
                    {!item.isRead && (
                        <button onClick={() => markRead(item._id)}>Mark as Read</button>
                    )}
                </div>
            ))}
        </section>
    );
}

export default Notifications;
