import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { EventConfigSchema } from "@/types/event";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import FeedItem from "../FeedItem";
import HackingDatesPicker from "./HackingDatesPicker";
import { Label } from "@/components/ui/label";
import { useAtomValue, useSetAtom } from "jotai";
import { eventConfigAtom, updateEventConfigAtom } from "@/atoms/event";
import { useBreakpoint } from "@/hooks/useMediaQuery";

export default function OrganizerView() {
	const config = useAtomValue(eventConfigAtom);
	const updateConfig = useSetAtom(updateEventConfigAtom);

	const isDesktop = useBreakpoint("lg");

	const [announcementText, setAnnouncementText] = useState("");

	useEffect(() => {
		if (config === null) {
			// set config if none exists
			const startTime = new Date();
			startTime.setHours(11, 0, 0);
			const endTime = new Date(startTime);
			endTime.setDate(startTime.getDate() + 1);

			const defaultConfig = EventConfigSchema.parse({
				hackingState: "setup",
				hackingStartTime: startTime.toISOString(),
				hackingEndTime: endTime.toISOString(),
				schedules: [],
				announcements: [],
				resources: [],
			});

			updateConfig(defaultConfig);

			console.log("No event config found, initializing default config");
		}
	}, [config, updateConfig]);

	const handlePostAnnouncement = (e: React.FormEvent) => {
		// should also handle sending to discord webhook

		e.preventDefault();
		if (!config || !announcementText.trim()) return;

		const newAnnouncement = {
			content: announcementText,
			timestamp: new Date().toISOString(),
		};

		updateConfig({
			announcements: [newAnnouncement, ...config.announcements],
		});
		setAnnouncementText("");
	};

	if (!config) return null;

	return (
		<FeedItem title="Organizer Settings">
			<div className="flex flex-col gap-4">
				<h4 className="text-xl font-synemono">Announcements</h4>

				<form onSubmit={handlePostAnnouncement}>
					<ButtonGroup className="w-full">
						<Input
							placeholder="Post an announcement"
							className="flex-1"
							value={announcementText}
							onChange={(e) => setAnnouncementText(e.target.value)}
						/>
						<Button type="submit" variant="outline" aria-label="Post">
							<SendIcon />
						</Button>
					</ButtonGroup>

					<p className="text-sm text-muted-foreground mt-2">
						Press ENTER to submit an announcement. Announcements will also be
						sent in the Discord server.
					</p>
				</form>

				<h4 className="text-xl font-synemono">Management</h4>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline">Manage Participants</Button>
					<Button variant="outline">Manage & Approve Teams</Button>
				</div>

				<h4 className="text-xl font-synemono">
					Configuration (saved automatically)
				</h4>

				<HackingDatesPicker
					startDate={
						config.hackingStartTime
							? new Date(config.hackingStartTime)
							: undefined
					}
					onStartDateChange={(date) =>
						updateConfig({
							hackingStartTime: date?.toISOString(),
						})
					}
					endDate={
						config.hackingEndTime ? new Date(config.hackingEndTime) : undefined
					}
					onEndDateChange={(date) =>
						updateConfig({
							hackingEndTime: date?.toISOString(),
						})
					}
				/>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline">Edit resources</Button>
					<Button variant="outline">Import schedule</Button>
					<Button
						variant="destructive"
						onClick={() => updateConfig(null)}
					>
						Reset event data
					</Button>
				</div>

				<Label>Hacking State</Label>

				<ButtonGroup orientation={isDesktop ? "horizontal" : "vertical"}>
					<Button
						variant={config.hackingState === "setup" ? "default" : "outline"}
						onClick={() =>
							updateConfig({ hackingState: "setup" })
						}
					>
						Setup (pre hacking)
					</Button>
					<Button
						variant={config.hackingState === "started" ? "default" : "outline"}
						onClick={() =>
							updateConfig({ hackingState: "started" })
						}
					>
						In progress (show countdown)
					</Button>
					<Button
						variant={config.hackingState === "judging" ? "default" : "outline"}
						onClick={() =>
							updateConfig({ hackingState: "judging" })
						}
					>
						Judging
					</Button>
					<Button
						variant={config.hackingState === "ended" ? "default" : "outline"}
						onClick={() =>
							updateConfig({ hackingState: "ended" })
						}
					>
						Ended
					</Button>
				</ButtonGroup>
			</div>
		</FeedItem>
	);
}
