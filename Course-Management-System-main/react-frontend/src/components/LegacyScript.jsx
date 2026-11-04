import { useEffect, useRef } from "react";

function LegacyScript({ src, module = false }) {
    const executed = useRef(false);

    useEffect(() => {
        if (executed.current) return;
        executed.current = true;

        const script = document.createElement("script");
        script.src = src;
        script.type = module ? "module" : "text/javascript";
        script.async = false;
        script.onload = function () {
            document.dispatchEvent(new Event("DOMContentLoaded"));
            window.dispatchEvent(new Event("load"));
        };
        script.onerror = function (error) {
            console.error("Unable to load legacy script:", src, error);
        };
        document.body.appendChild(script);
    }, [src, module]);

    return null;
}

export default LegacyScript;