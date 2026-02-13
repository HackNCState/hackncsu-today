export const notificationsService = {
	isPermissionGranted: (): boolean => {
		return (
			typeof Notification !== "undefined" &&
			Notification.permission === "granted"
		);
	},

	requestNotificationPermission: async (): Promise<NotificationPermission> => {
		if (typeof Notification === "undefined") return "denied";
		try {
			return await Notification.requestPermission();
		} catch (err) {
			console.error("Notification permission failed:", err);
			return "denied";
		}
	},

	sendNotification: (title: string, body?: string) => {
		if (!notificationsService.isPermissionGranted()) return;
		try {
			new Notification(title, { body });
		} catch (err) {
			console.error("Notification failed:", err);
		}
	},
};
