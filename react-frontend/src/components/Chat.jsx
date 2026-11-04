import { useEffect, useRef, useState } from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socketClient";

const OBJECT_ID = /^[a-f\d]{24}$/i;

function Chat() {
    const socketRef = useRef(null);
    const recipientRef = useRef("");
    const [connected, setConnected] = useState(false);
    const [recipientId, setRecipientId] = useState("");
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState("");

    const myId = sessionStorage.getItem("userId") || "";

    useEffect(() => {
        const client = createSocket();

        client.on("connect", () => {
            setConnected(true);
            setError("");
        });

        client.on("disconnect", () => {
            setConnected(false);
        });

        client.on("connect_error", (err) => {
            setConnected(false);
            setError(err.message);
        });

        // Only show messages that belong to the conversation currently open.
        client.on("receive_message", (data) => {
            const other = recipientRef.current;
            const belongs =
                (data.sender === other && data.recipient === myId) ||
                (data.sender === myId && data.recipient === other);
            if (!belongs) return;

            setMessages((previous) =>
                previous.some((item) => item._id === data._id)
                    ? previous
                    : [...previous, data]
            );
        });

        client.connect();
        socketRef.current = client;

        return () => {
            client.disconnect();
            socketRef.current = null;
        };
    }, [myId]);

    function handleRecipientChange(event) {
        const value = event.target.value.trim();
        recipientRef.current = value;
        setRecipientId(value);
        setMessages([]); // reset when switching conversations
        setError("");
    }

    async function loadHistory() {
        if (!OBJECT_ID.test(recipientId)) {
            setError("Enter a valid 24-character recipient user ID first");
            return;
        }
        try {
            const response = await apiClient.get(`/messages/${recipientId}`);
            setMessages(response.data.messages);
            setError("");
        } catch {
            setError("Unable to load message history");
        }
    }

    function sendMessage(event) {
        event.preventDefault();
        const socket = socketRef.current;
        if (!socket || !connected) return;

        socket.emit(
            "send_message",
            { recipientId, text: message },
            (result) => {
                if (result && result.success) {
                    setMessage("");
                    setError("");
                } else {
                    setError((result && result.message) || "Message failed");
                }
            }
        );
    }

    return (
        <section style={{ marginBottom: "32px" }}>
            <h2>Chat</h2>
            <p>
                Connection:{" "}
                <strong style={{ color: connected ? "green" : "crimson" }}>
                    {connected ? "Online" : "Offline"}
                </strong>
            </p>
            {myId && (
                <p style={{ fontSize: "14px" }}>
                    Your user ID (share it so others can message you): <code>{myId}</code>
                </p>
            )}
            {error && (
                <p role="alert" style={{ color: "crimson", fontWeight: "bold" }}>
                    {error}
                </p>
            )}
            <form
                onSubmit={sendMessage}
                style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}
            >
                <input
                    value={recipientId}
                    onChange={handleRecipientChange}
                    placeholder="Recipient MongoDB user ID"
                    style={{ flex: "1 1 260px", padding: "8px" }}
                    required
                />
                <button type="button" onClick={loadHistory}>
                    Load Chat History
                </button>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                    maxLength={2000}
                    style={{ flex: "1 1 260px", padding: "8px" }}
                    required
                />
                <button type="submit" disabled={!connected}>
                    Send
                </button>
            </form>

            <h3>Messages</h3>
            {messages.length === 0 && <p>No messages in this conversation yet.</p>}
            {messages.map((item) => (
                <p key={item._id}>
                    <strong>{item.sender === myId ? "Me" : "Them"}:</strong>{" "}
                    {item.text}
                </p>
            ))}
        </section>
    );
}

export default Chat;
