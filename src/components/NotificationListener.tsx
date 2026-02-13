import { announcementsAtom } from "@/atoms/event/announcements";
import { hackingUrgencyAtom } from "@/atoms/event/countdown";
import { schedulesAtom } from "@/atoms/event/schedule";
import {
	notificationSettingsAtom,
	requestAnnouncementNotificationAtom,
	requestScheduleChangeNotificationAtom,
	requestTimerStateNotificationAtom,
} from "@/atoms/notifications";
import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useRef } from "react";

export default function NotificationListener() {
	const enableNotifications = useAtomValue(notificationSettingsAtom);
	const requestAnnouncementNotification = useSetAtom(
		requestAnnouncementNotificationAtom,
	);
	const announcements = useAtomValue(announcementsAtom);
	const prevAnnouncementTimestampRef = useRef<string | null>(null);

	const requestScheduleChangeNotification = useSetAtom(
		requestScheduleChangeNotificationAtom,
	);
	const schedules = useAtomValue(schedulesAtom);
	const prevOngoingTitleRef = useRef<string | null>(null);

	const requestTimerStateNotification = useSetAtom(
		requestTimerStateNotificationAtom,
	);
	const hackingUrgency = useAtomValue(hackingUrgencyAtom);
	const prevHackingUrgencyRef = useRef<string | null>(null);

	useEffect(() => {
		if (!enableNotifications || !announcements.length) return;

		const latestAnnouncement = announcements[0];

		const latestTimestamp = Date.parse(latestAnnouncement.timestamp);
		const prevTimestampStr = prevAnnouncementTimestampRef.current;

		if (!prevTimestampStr) {
			prevAnnouncementTimestampRef.current = latestAnnouncement.timestamp;
			return;
		}

		if (Date.parse(prevTimestampStr) < latestTimestamp) {
			prevAnnouncementTimestampRef.current = latestAnnouncement.timestamp;

			if (document.hidden) {
				requestAnnouncementNotification(latestAnnouncement);
			}
		}
	}, [announcements, requestAnnouncementNotification, enableNotifications]);

	useEffect(() => {
		if (!enableNotifications) return;

		const ongoingItem = schedules
			.flatMap((s) => s.items)
			.find((i) => i.state === "ongoing");

		if (!ongoingItem) return;

		const currentTitle = ongoingItem.title;

		if (!prevOngoingTitleRef.current) {
			prevOngoingTitleRef.current = currentTitle;
			return;
		}

		if (prevOngoingTitleRef.current !== currentTitle) {
			prevOngoingTitleRef.current = currentTitle;

			if (document.hidden) {
				requestScheduleChangeNotification(ongoingItem);
			}
		}
	}, [schedules, requestScheduleChangeNotification, enableNotifications]);

	useEffect(() => {
		if (!enableNotifications) return;

		const currentUrgency = hackingUrgency;
		const prevUrgency = prevHackingUrgencyRef.current;

		if (!prevUrgency) {
			prevHackingUrgencyRef.current = currentUrgency;
			return;
		}

		if (prevUrgency !== currentUrgency) {
			prevHackingUrgencyRef.current = currentUrgency;

			if (document.hidden) {
				if (prevUrgency === "startingSoon" && currentUrgency === "ongoing") {
					requestTimerStateNotification({
						title: "You may begin!",
						body: "It's time to start hacking. Good luck!",
					});
				} else if (currentUrgency === "timesUp") {
					requestTimerStateNotification({
						title: "Time's up!",
						body: "Hacking is officially over. Judging will commence after lunchtime.",
					});
				} else if (currentUrgency === "halfway") {
					requestTimerStateNotification({
						title: "Halfway there...",
						body: "You've got 12 hours to go. Keep it up!",
					});
				} else if (currentUrgency === "lastHour") {
					requestTimerStateNotification({
						title: "One hour to go...",
						body: "Add those finishing touches and submit your project!",
					});
				} else if (currentUrgency === "last10Minutes") {
					requestTimerStateNotification({
						title: "10 minutes to go...",
						body: "Submissions close in 10 minutes! Submit ASAP.",
					});
				}
			}
		}
	}, [hackingUrgency, requestTimerStateNotification, enableNotifications]);

	return null;
}
