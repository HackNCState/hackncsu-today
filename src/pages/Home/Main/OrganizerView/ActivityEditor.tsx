import {
	activitiesAtom,
	addActivityAtom,
	deleteActivityAtom,
	setActivityAtom,
} from "@/atoms/event/activities";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Activity } from "@/types/event";
import { useAtomValue, useSetAtom } from "jotai";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";

function ActivityForm({
	initialActivity,
	onSave,
	onCancel,
}: {
	initialActivity?: Activity;
	onSave: (activity: Activity) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initialActivity?.name ?? "");
	const [excludeFromRaffle, setExcludeFromRaffle] = useState(
		initialActivity ? !initialActivity.eligibleForRaffle : false,
	);
	const excludeId = useId();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave({ name, eligibleForRaffle: !excludeFromRaffle });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label>Name</Label>
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Activity Name"
					required
				/>
			</div>

			<div className="flex items-center gap-2">
				<Checkbox
					id={excludeId}
					checked={excludeFromRaffle}
					onCheckedChange={(checked) => setExcludeFromRaffle(checked === true)}
				/>
				<Label htmlFor={excludeId}>Exclude from raffle</Label>
			</div>

			<div className="flex justify-end gap-2">
				<Button type="button" variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	);
}

export default function ActivityEditor() {
	const activities = useAtomValue(activitiesAtom);
	const addActivity = useSetAtom(addActivityAtom);
	const deleteActivity = useSetAtom(deleteActivityAtom);
	const setActivity = useSetAtom(setActivityAtom);

	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Activities</h3>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Activity
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Activity</DialogTitle>
						</DialogHeader>
						<ActivityForm
							onSave={(activity) => {
								addActivity(activity);
								setIsAddOpen(false);
							}}
							onCancel={() => setIsAddOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4">
				{activities.map((activity, index) => (
					<div
						key={activity.name}
						className="flex items-center justify-between rounded-lg border p-4 bg-card"
					>
						<div className="flex flex-col gap-1">
							<span className="font-medium">{activity.name}</span>
							{!activity.eligibleForRaffle && (
								<span className="text-xs text-muted-foreground">
									Excluded from raffle
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Dialog
								open={editingIndex === index}
								onOpenChange={(open) => setEditingIndex(open ? index : null)}
							>
								<DialogTrigger asChild>
									<Button variant="ghost" size="icon">
										<Edit2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit Activity</DialogTitle>
									</DialogHeader>
									<ActivityForm
										initialActivity={activity}
										onSave={(updatedActivity) => {
											setActivity({
												index,
												activity: updatedActivity,
											});
											setEditingIndex(null);
										}}
										onCancel={() => setEditingIndex(null)}
									/>
								</DialogContent>
							</Dialog>

							<Button
								variant="ghost"
								size="icon"
								className="text-destructive hover:text-destructive"
								onClick={() => {
									if (
										confirm("Are you sure you want to delete this activity?")
									) {
										deleteActivity(index);
									}
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
				{activities.length === 0 && (
					<div className="text-center text-sm text-muted-foreground py-8">
						No activities configured
					</div>
				)}
			</div>
		</div>
	);
}
