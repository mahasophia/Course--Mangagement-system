import { useEffect, useRef, useState } from "react";
import apiClient from "../api/apiClient";
import { createSocket } from "../api/socketClient";
import "./Chat.css";

const AVATAR_COLORS = ["#00a884", "#6b7cff", "#e5588b", "#d9822b", "#8e5bd9", "#2f9bd1", "#c1473b"];

function avatarColor(name) {
    let hash = 0;
    for (const char of name || "?") hash = (hash * 31 + char.charCodeAt(0)) % 997;
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initial(name) {
    return (name || "?").trim().charAt(0).toUpperCase();
}

function timeLabel(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
        ? ""
        : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function dayLabel(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

// Contact-list time: clock for today, "Yesterday", otherwise the date
function listTime(value) {
    const label = dayLabel(value);
    return label === "Today" ? timeLabel(value) : label;
}

function Avatar({ name, small }) {
    return (
        <span
            className={`chat-avatar${small ? " small" : ""}`}
            style={{ background: avatarColor(name) }}
        >
            {initial(name)}
        </span>
    );
}

function Chat() {
    const socketRef = useRef(null);
    const selectedRef = useRef("");
    const bottomRef = useRef(null);

    const [connected, setConnected] = useState(false);
    const [contacts, setContacts] = useState([]);
    const [search, setSearch] = useState("");
    const [selected, setSelected] = useState(null);
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [unread, setUnread] = useState({});
    const [error, setError] = useState("");

    const myId = sessionStorage.getItem("userId") || "";

    // People you can chat with (+ last message of each chat)
    useEffect(() => {
        let active = true;
        apiClient
            .get("/messages/contacts")
            .then((response) => {
                if (active) setContacts(response.data.contacts);
            })
            .catch(() => {
                if (active) setError("Unable to load contacts");
            });
        return () => {
            active = false;
        };
    }, []);

    // Live socket connection
    useEffect(() => {
        const client = createSocket();

        client.on("connect", () => {
            setConnected(true);
            setError("");
        });
        client.on("disconnect", () => setConnected(false));
        client.on("connect_error", (err) => {
            setConnected(false);
            setError(err.message);
        });

        client.on("receive_message", (data) => {
            const open = selectedRef.current;
            const otherId = data.sender === myId ? data.recipient : data.sender;
            const inOpenChat = otherId === open;

            // Update the contact list preview and move that chat to the top
            setContacts((previous) => {
                const target = previous.find((contact) => contact._id === otherId);
                if (!target) return previous;
                const updated = {
                    ...target,
                    lastMessage: {
                        text: data.text,
                        createdAt: data.createdAt,
                        fromMe: data.sender === myId,
                    },
                };
                return [updated, ...previous.filter((contact) => contact._id !== otherId)];
            });

            if (inOpenChat) {
                setMessages((previous) =>
                    previous.some((item) => item._id === data._id)
                        ? previous
                        : [...previous, data]
                );
            } else if (data.sender !== myId) {
                setUnread((previous) => ({
                    ...previous,
                    [data.sender]: (previous[data.sender] || 0) + 1,
                }));
            }
        });

        client.connect();
        socketRef.current = client;

        return () => {
            client.disconnect();
            socketRef.current = null;
        };
    }, [myId]);

    // Always scroll to the newest message
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messages, selected]);

    async function openChat(contact) {
        selectedRef.current = contact._id;
        setSelected(contact);
        setMessages([]);
        setError("");
        setUnread((previous) => ({ ...previous, [contact._id]: 0 }));

        try {
            const response = await apiClient.get(`/messages/${contact._id}`);
            if (selectedRef.current === contact._id) {
                setMessages(response.data.messages);
            }
        } catch {
            setError("Unable to load message history");
        }
    }

    function closeChat() {
        selectedRef.current = "";
        setSelected(null);
        setMessages([]);
    }

    function sendMessage(event) {
        event.preventDefault();
        const socket = socketRef.current;
        const body = text.trim();
        if (!selected || !socket || !connected || !body) return;

        socket.emit("send_message", { recipientId: selected._id, text: body }, (result) => {
            if (result && result.success) {
                setText("");
                setError("");
            } else {
                setError((result && result.message) || "Message failed");
            }
        });
    }

    const filtered = contacts.filter((contact) =>
        contact.name.toLowerCase().includes(search.trim().toLowerCase())
    );

    return (
        <section className={`chat-box${selected ? " has-selection" : ""}`}>
            <aside className="chat-sidebar">
                <div className="chat-sidebar-head">
                    <div className="chat-sidebar-top">
                        <h2>Chats</h2>
                        <span className={`chat-conn ${connected ? "online" : "offline"}`}>
                            {connected ? "Connected" : "Offline"}
                        </span>
                    </div>
                    <input
                        className="chat-search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search or start a new chat"
                    />
                </div>
                <div className="chat-contacts">
                    {filtered.length === 0 && (
                        <p className="chat-empty-list">No contacts found.</p>
                    )}
                    {filtered.map((contact) => {
                        const count = unread[contact._id] || 0;
                        const last = contact.lastMessage;
                        return (
                            <button
                                key={contact._id}
                                type="button"
                                className={`chat-contact${selected?._id === contact._id ? " active" : ""}`}
                                onClick={() => openChat(contact)}
                            >
                                <Avatar name={contact.name} />
                                <span className="chat-contact-info">
                                    <span className="chat-contact-row">
                                        <span className="chat-contact-name">{contact.name}</span>
                                        {last && (
                                            <span className={`chat-contact-time${count ? " has-unread" : ""}`}>
                                                {listTime(last.createdAt)}
                                            </span>
                                        )}
                                    </span>
                                    <span className="chat-contact-row">
                                        <span className="chat-contact-preview">
                                            {last
                                                ? `${last.fromMe ? "✓ " : ""}${last.text}`
                                                : contact.role}
                                        </span>
                                        {count > 0 && <span className="chat-unread">{count}</span>}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                </div>
            </aside>

            <div className="chat-main">
                {!myId && (
                    <p className="chat-error">Please log out and log in again to use chat.</p>
                )}

                {selected ? (
                    <>
                        <div className="chat-header">
                            <button
                                type="button"
                                className="chat-back"
                                onClick={closeChat}
                                aria-label="Back to chats"
                            >
                                ←
                            </button>
                            <Avatar name={selected.name} small />
                            <span className="chat-header-text">
                                <span className="chat-header-name">{selected.name}</span>
                                <span className="chat-header-sub">{selected.role}</span>
                            </span>
                        </div>

                        {error && <p className="chat-error" role="alert">{error}</p>}

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <p className="chat-placeholder">
                                    No messages yet. Say hello to {selected.name}!
                                </p>
                            )}
                            {messages.map((item, index) => {
                                const previous = messages[index - 1];
                                const newDay =
                                    !previous ||
                                    dayLabel(previous.createdAt) !== dayLabel(item.createdAt);
                                const mine = item.sender === myId;
                                const first = newDay || previous.sender !== item.sender;
                                return (
                                    <div key={item._id} style={{ display: "contents" }}>
                                        {newDay && (
                                            <span className="chat-day">{dayLabel(item.createdAt)}</span>
                                        )}
                                        <div
                                            className={`chat-row ${mine ? "mine" : "theirs"}${first ? " first" : ""}`}
                                        >
                                            <div className="chat-bubble">
                                                {item.text}
                                                <span className="chat-meta">
                                                    {timeLabel(item.createdAt)}
                                                    {mine && <span className="chat-tick">✓</span>}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>

                        <form className="chat-form" onSubmit={sendMessage}>
                            <input
                                className="chat-input"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                placeholder="Type a message"
                                maxLength={2000}
                                autoComplete="off"
                            />
                            <button
                                className="chat-send"
                                type="submit"
                                disabled={!connected || !text.trim()}
                                aria-label="Send message"
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M2.01 21 23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="chat-messages">
                        {error && <p className="chat-error" role="alert">{error}</p>}
                        <p className="chat-placeholder">
                            Select a chat from the list to start messaging.
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default Chat;
