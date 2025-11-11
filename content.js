function hasTextSelection() {
    const selection = window.getSelection();
    return selection && selection.toString().trim().length > 0;
}

function cleanPageTitle(title) {
    return title
        .replace(/ - Jira$/, "")
        .replace(/ by .+$/, "")
        .trim();
}

async function copyLinkToClipboard(url, title) {
    try {
        const html = `<a href="${url}">${title}</a>`;
        const plainText = url;

        // Create a blob for HTML
        const htmlBlob = new Blob([html], { type: "text/html" });
        const textBlob = new Blob([plainText], { type: "text/plain" });

        // Write to clipboard with both formats
        await navigator.clipboard.write([
            new ClipboardItem({
                "text/html": htmlBlob,
                "text/plain": textBlob,
            }),
        ]);

        return true;
    } catch (error) {
        console.error("Copyist: Failed to copy to clipboard:", error);
        return false;
    }
}

function showCopyFeedback() {
    const notification = document.createElement("div");
    notification.textContent = "Copied formatted link";
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4a154b;
        color: white;
        padding: 12px 20px;
        border-radius: 3px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        font-weight: 400;
        z-index: 20000;
        animation: slideIn 0.2s ease-out;
    `;

    const style = document.createElement("style");
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(20px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.style.animation = "slideIn 0.3s ease-out reverse";
        setTimeout(() => {
            notification.remove();
            style.remove();
        }, 300);
    }, 2000);
}

document.addEventListener(
    "keydown",
    async (event) => {
        const isCopyShortcut =
            (event.metaKey || event.ctrlKey) && event.key === "c";

        if (!isCopyShortcut) {
            return;
        }

        if (hasTextSelection()) {
            console.log(
                "Copyist: Text is selected, allowing default copy behavior"
            );
            return;
        }

        event.preventDefault();
        event.stopPropagation();

        console.info(
            "Copyist: Cmd+C pressed with no selection, copying Slack link"
        );

        const rawTitle = document.title;
        const pageTitle = cleanPageTitle(rawTitle);
        const pageUrl = window.location.href;

        const success = await copyLinkToClipboard(pageUrl, pageTitle);

        if (success) {
            showCopyFeedback();
        }
    },
    true
);
