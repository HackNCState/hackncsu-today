import {
	addResourceAtom,
	deleteResourceAtom,
	resourcesAtom,
	setResourceAtom,
} from "@/atoms/event/resources";
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { Resource } from "@/types/event";
import { useAtomValue, useSetAtom } from "jotai";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { useId, useState } from "react";

function ResourceForm({
	initialResource,
	onSave,
	onCancel,
}: {
	initialResource?: Resource;
	onSave: (resource: Resource) => void;
	onCancel: () => void;
}) {
	const [type, setType] = useState<"link" | "text">(
		initialResource?.type ?? "text",
	);
	const [label, setLabel] = useState(initialResource?.label ?? "");
	const [url, setUrl] = useState(
		initialResource?.type === "link" ? initialResource.url : "",
	);
	const [content, setContent] = useState(
		initialResource?.type === "text" ? initialResource.content : "",
	);
	const [hidden, setHidden] = useState(initialResource?.hidden ?? false);

	const checkboxID = useId();

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (type === "link") {
			onSave({ type: "link", label, url, hidden });
		} else {
			onSave({ type: "text", label, content, hidden });
		}
	};

	const isTracks = initialResource?.label === "Tracks";

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-4">
			<div className="flex flex-col gap-2">
				<Label>Type</Label>
				<Select
					value={type}
					onValueChange={(v) => setType(v as "link" | "text")}
					disabled={isTracks}
				>
					<SelectTrigger>
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="text">Text</SelectItem>
						<SelectItem value="link">Link</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Label</Label>
				<Input
					value={label}
					onChange={(e) => setLabel(e.target.value)}
					placeholder="Resource Label"
					required
					disabled={isTracks}
				/>
			</div>

			{type === "link" ? (
				<div className="flex flex-col gap-2">
					<Label>URL</Label>
					<Input
						value={url}
						onChange={(e) => setUrl(e.target.value)}
						placeholder="https://example.com"
						type="url"
						required
					/>
				</div>
			) : (
				<div className="flex flex-col gap-2">
					<Label>Content</Label>
					<Textarea
						value={content}
						className="h-48"
						onChange={(e) => setContent(e.target.value)}
						placeholder="You can use markdown (**bold**, _italic_, [links](https://example.com), etc.)"
						required
						disabled={isTracks}
					/>
					{isTracks && (
						<p className="text-xs text-muted-foreground">
							This content is automatically generated from the Tracks
							configuration.
						</p>
					)}
				</div>
			)}

			<div className="flex items-center gap-2">
				<Checkbox
					id={checkboxID}
					checked={hidden}
					onCheckedChange={(checked) => setHidden(checked === true)}
				/>
				<Label htmlFor={checkboxID}>Hidden for participants</Label>
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

export default function ResourceEditor() {
	const resources = useAtomValue(resourcesAtom);
	const addResource = useSetAtom(addResourceAtom);
	const deleteResource = useSetAtom(deleteResourceAtom);
	const setResource = useSetAtom(setResourceAtom);

	const [isAddOpen, setIsAddOpen] = useState(false);
	const [editingIndex, setEditingIndex] = useState<number | null>(null);

	return (
		<div className="flex flex-col gap-4">
			<div className="flex justify-between items-center">
				<h3 className="text-lg font-semibold">Resources</h3>
				<Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
					<DialogTrigger asChild>
						<Button size="sm">
							<Plus className="w-4 h-4 mr-2" />
							Add Resource
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add Resource</DialogTitle>
						</DialogHeader>
						<ResourceForm
							onSave={(resource) => {
								addResource(resource);
								setIsAddOpen(false);
							}}
							onCancel={() => setIsAddOpen(false)}
						/>
					</DialogContent>
				</Dialog>
			</div>

			<div className="flex flex-col gap-2 overflow-y-auto max-h-128">
				{resources.map((resource, index) => (
					<div
						key={index} // TODO: change if we will reorder resources
						className="flex items-center justify-between p-3 border rounded-md bg-card"
					>
						<div className="flex flex-col">
							<span className="font-medium">
								{resource.label}
								{resource.hidden && (
									<span className="ml-2 text-xs text-muted-foreground">
										(Hidden)
									</span>
								)}
							</span>
							<span className="text-sm text-muted-foreground">
								{resource.type === "link" ? resource.url : resource.content}
							</span>
						</div>
						<div className="flex gap-2">
							<Dialog
								open={editingIndex === index}
								onOpenChange={(open) => setEditingIndex(open ? index : null)}
							>
								<DialogTrigger asChild>
									<Button variant="ghost" size="icon">
										<Edit2 className="w-4 h-4" />
									</Button>
								</DialogTrigger>
								<DialogContent>
									<DialogHeader>
										<DialogTitle>Edit Resource</DialogTitle>
									</DialogHeader>
									<ResourceForm
										initialResource={resource}
										onSave={(updatedResource) => {
											setResource({ index, resource: updatedResource });
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
								onClick={() => deleteResource(index)}
								disabled={resource.label === "Tracks"}
							>
								<Trash2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				))}
				{resources.length === 0 && (
					<p className="text-center text-muted-foreground py-4">
						No resources added yet.
					</p>
				)}
			</div>
		</div>
	);
}
