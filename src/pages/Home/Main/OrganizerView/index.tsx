import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { firestoreService } from "@/services/firestore.service";
import type { EventConfig } from "@/types/event";
import { SendIcon } from "lucide-react";
import { useEffect, useState } from "react";
import FeedItem from "../FeedItem";
import HackingDatesPicker from "./HackingDatesPicker";

export default function OrganizerView() {
	// TODO: replace with atom listener
	const [config, setConfig] = useState<EventConfig | null>(null);

	useEffect(() => {
		firestoreService.fetchEventConfig().then((data) => {
			if (data) {
				setConfig(data);
			} else {
				// set config if none exists
				const startTime = new Date();
				startTime.setHours(11, 0, 0);
				const endTime = new Date(startTime);
				endTime.setDate(startTime.getDate() + 1);

				setConfig({
					hackingState: "setup",
					hackingStartTime: startTime.toISOString(),
					hackingEndTime: endTime.toISOString(),
					schedules: [],
					announcements: [],
					resources: [],
				});

				console.log("No event config found, initializing default config");
			}
		});
	}, []);

	const updateConfig = (updates: Partial<EventConfig>) => {
		if (!config) return;
		const newConfig = { ...config, ...updates };
		setConfig(newConfig);
		firestoreService.updateEventConfig(updates);
	};

	if (!config) return null;

	return (
		<FeedItem title="Organizer Settings">
			<div className="flex flex-col gap-4">
				<h4 className="text-xl font-synemono">Announcements</h4>

				<ButtonGroup className="w-full">
					<Input placeholder="Post an announcement" className="flex-1" />
					<Button variant="outline" aria-label="Search">
						<SendIcon />
					</Button>
				</ButtonGroup>

				<h4 className="text-xl font-synemono">Event Configuration</h4>

				<HackingDatesPicker
					startDate={
						config.hackingStartTime
							? new Date(config.hackingStartTime)
							: undefined
					}
					onStartDateChange={(date) =>
						updateConfig({ hackingStartTime: date?.toISOString() })
					}
					endDate={
						config.hackingEndTime ? new Date(config.hackingEndTime) : undefined
					}
					onEndDateChange={(date) =>
						updateConfig({ hackingEndTime: date?.toISOString() })
					}
				/>

				<div className="flex flex-wrap gap-2">
					<Button variant="outline">Edit resources</Button>
					<Button variant="outline">Import schedule</Button>
					<Button
						variant="destructive"
						onClick={() => firestoreService.clearEventConfig()}
					>
						Reset event data
					</Button>
				</div>

				<h4 className="text-xl font-synemono">Event State</h4>

				<ButtonGroup>
					<Button
						variant={config.hackingState === "setup" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "setup" })}
					>
						Setup
					</Button>
					<Button
						variant={config.hackingState === "started" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "started" })}
					>
						In progress (show countdown)
					</Button>
					<Button
						variant={config.hackingState === "judging" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "judging" })}
					>
						Judging
					</Button>
					<Button
						variant={config.hackingState === "ended" ? "default" : "outline"}
						onClick={() => updateConfig({ hackingState: "ended" })}
					>
						Ended
					</Button>
				</ButtonGroup>
			</div>
		</FeedItem>
	);
}
