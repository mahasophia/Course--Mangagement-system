import PageShell from "../components/PageShell";
import Chat from "../components/Chat";
import NotificationsPanel from "../components/Notifications";

export default function Messages() {
    return (
        <PageShell>
            <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px 16px" }}>
                <Chat />
                <NotificationsPanel />
            </main>
        </PageShell>
    );
}
