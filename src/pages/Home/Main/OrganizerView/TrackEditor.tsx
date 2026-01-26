import {
	addTrackAtom,
	deleteTrackAtom,
	setTrackAtom,
	tracksAtom,
} from "@/atoms/event/tracks";
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
import type { Track } from "@/types/event/event";
import { useAtomValue, useSetAtom } from "jotai";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

function TrackForm({
	initialTrack,
	onSave,
	onCancel,
}: {
	initialTrack?: Track;
	onSave: (track: Track) => void;
	onCancel: () => void;
}) {
	const [name, setName] = useState(initialTrack?.name ?? "");
	const [description, setDescription] = useState(
		initialTrack?.description ?? "",
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
					placeholder="Track Name"
					required
				/>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Description</Label>
				<Textarea
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					placeholder="Track Description"
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

export function TrackEditor() {
	const tracks = useAtomValue(tracksAtom);
	const addTrack = useSetAtom(addTrackAtom);
	const deleteTrack = useSetAtom(deleteTrackAtom);
	const setTrack = useSetAtom(setTrackAtom);

	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-between">
				<h3 className="text-lg font-semibold">Tracks</h3>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="mr-2 h-4 w-4" />
							Add Track
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Track</DialogTitle>
						</DialogHeader>
						<TrackForm
							onSave={(track) => {
								addTrack(track);
								setIsAddOpen(false);
							}}
							onCancel={() => setIsAddOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="grid gap-4">
				{tracks.map((track, index) => (
					<div
						key={index}
						className="flex items-center justify-between rounded-lg border p-4 bg-card"
					>
						<div className="flex flex-col gap-1">
							<span className="font-medium">{track.name}</span>
							{track.description && (
								<span className="text-sm text-muted-foreground">
									{track.description}
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
										<DialogTitle>Edit Track</DialogTitle>
									</DialogHeader>
									<TrackForm
										initialTrack={track}
										onSave={(updatedTrack) => {
											setTrack({
												index,
												track: updatedTrack,
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
									if (confirm("Are you sure you want to delete this track?")) {
										deleteTrack(index);
									}
								}}
							>
								<Trash2 className="h-4 w-4" />
							</Button>
						</div>
					</div>
				))}
				{tracks.length === 0 && (
					<div className="text-center text-sm text-muted-foreground py-8">
						No tracks configured
					</div>
				)}
			</div>
		</div>
	);
}
