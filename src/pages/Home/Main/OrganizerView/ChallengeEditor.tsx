import {
	addChallengeAtom,
	deleteChallengeAtom,
	setChallengeAtom,
	challengesAtom,
} from "@/atoms/event/challenges";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Challenge } from "@/types/event/event";
import { useAtomValue, useSetAtom } from "jotai";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function ChallengeForm({
	initialChallenge,
	onSave,
	onCancel,
}: {
	initialChallenge?: Challenge;
	onSave: (challenge: Challenge) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initialChallenge?.name ?? "");
	const [description, setDescription] = useState(
		initialChallenge?.description ?? "",
	);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		onSave({ name, description });
	};

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label>Name</Label>
				<Input
					value={name}
					onChange={(e) => setName(e.target.value)}
					placeholder="Challenge Name"
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Description</Label>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Challenge Description"
				/>
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

export function ChallengeEditor() {
	const challenges = useAtomValue(challengesAtom);
	const addChallenge = useSetAtom(addChallengeAtom);
	const deleteChallenge = useSetAtom(deleteChallengeAtom);
	const setChallenge = useSetAtom(setChallengeAtom);

	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Challenges</h3>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Challenge
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Challenge</DialogTitle>
						</DialogHeader>
						<ChallengeForm
							onSave={(challenge) => {
								addChallenge(challenge);
								setIsAddOpen(false);
							}}
							onCancel={() => setIsAddOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4">
				{challenges.map((challenge, index) => (
					<div
						key={index}
						className="flex items-center justify-between rounded-lg border p-4 bg-card"
					>
						<div className="flex flex-col gap-1">
							<span className="font-medium">{challenge.name}</span>
							{challenge.description && (
								<span className="text-sm text-muted-foreground">
									{challenge.description}
								</span>
							)}
						</div>
						<div className="flex items-center gap-2">
							<Dialog
								open={editingIndex === index}
								onOpenChange={(open) => {
									if (!open) setEditingIndex(null);
									else setEditingIndex(index);
								}}
							>
								<DialogTrigger asChild>
									<Button variant="ghost" size="icon">
										<Edit2 className="h-4 w-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit Challenge</DialogTitle>
									</DialogHeader>
									<ChallengeForm
										initialChallenge={challenge}
										onSave={(updatedChallenge) => {
											setChallenge({ index, challenge: updatedChallenge });
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
										confirm("Are you sure you want to delete this challenge?")
									) {
										deleteChallenge(index);
									}
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
				{challenges.length === 0 && (
					<div className="text-center text-sm text-muted-foreground py-8">
						No challenges configured
					</div>
				)}
			</div>
		</div>
	);
}
