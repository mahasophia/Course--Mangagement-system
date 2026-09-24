import Navbar from "./Navbar";
import Footer from "./Footer";

function PageShell({ children, variant = "student" }) {
    let footerVariant = "standard";
    if (variant === "admin" || variant === "adminnone") {
        footerVariant = "admin";
    }
    if (variant === "student3") {
        footerVariant = "learn";
    }
    return (
        <>
            <Navbar />
            {children}
            <Footer variant={footerVariant} />
        </>
    );
}

export default PageShell;