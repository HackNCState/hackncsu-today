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

        isValidDiscordWebhook(value: string): boolean {
            try {
                const url = new URL(value);

                return (
                    url.protocol === "https:" &&
                    url.hostname.endsWith("discord.com") &&
                    url.pathname.startsWith("/api/webhooks/")
                );
            } catch {
                return false;
            }
        }
    };