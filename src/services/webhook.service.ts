export const webhookService = {
    postMessage: async (url: string | undefined, message: string) => {
        if (!url) {
            return;
        }
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ content: message }),
        });

        if (!res.ok) {
            throw new Error("Failed to post message to webhook");
        }
    },
};