import { useEffect } from "react";

function PageCss({ href }) {
    useEffect(() => {
        const existing = document.querySelector(`link[data-page-css="${href}"]`);
        if (existing) return;

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = href;
        link.dataset.pageCss = href;
        document.head.appendChild(link);

        return () => {
            const current = document.querySelector(`link[data-page-css="${href}"]`);
            if (current) current.remove();
        };
    }, [href]);

    return null;
}

export default PageCss;