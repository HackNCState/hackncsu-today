import { useState } from "react";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldTitle,
} from "@/components/ui/field";
import { Checkbox } from "@/components/ui/checkbox";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ChevronDown } from "lucide-react";
import type { ChecklistItem } from "@/types/event";

interface ChecklistItemRowProps {
	item: ChecklistItem;
	isChecked: boolean;
	onToggle?: (id: string, checked: boolean) => void;
}

export default function ChecklistItemRow({
	item,
	isChecked,
	onToggle,
}: ChecklistItemRowProps) {
	const [isOpen, setIsOpen] = useState(false);

	const handleCardClick = () => {
		setIsOpen((prev) => !prev);
	};

	const handleCheckboxClick = (e: React.MouseEvent) => {
		e.stopPropagation();
	};

	const handleCheckboxChange = (checked: boolean) => {
		onToggle?.(item.id, checked);
	};

	return (
		<div>
			<Field orientation="horizontal">
				<Checkbox
					id={`checklist-${item.id}`}
					name={`checklist-${item.id}`}
					checked={isChecked}
					disabled={item.autoChecked}
					onClick={handleCheckboxClick}
					onCheckedChange={handleCheckboxChange}
				/>
				<FieldContent className="gap-1">
					<div
						className="flex items-center justify-between gap-2 cursor-pointer"
						onClick={handleCardClick}
					>
						<FieldTitle>{item.title}</FieldTitle>
						<ChevronDown
							className={`size-4 text-muted-foreground transition ${
								isOpen ? "rotate-180" : "rotate-0"
							}`}
						/>
					</div>
					<div
						className={`grid transition-[grid-template-rows,opacity] duration-200 ${
							isOpen
								? "grid-rows-[1fr] opacity-100"
								: "grid-rows-[0fr] opacity-0"
						}`}
					>
						<div className="overflow-hidden">
							<FieldDescription className="prose prose-slate dark:prose-invert max-w-none">
								<ReactMarkdown
									remarkPlugins={[remarkGfm]}
									components={{
										a: ({ children, href }) => (
											<a
												href={href}
												target="_blank"
												rel="noopener noreferrer"
												onClick={(event) => event.stopPropagation()}
											>
												{children}
											</a>
										),
									}}
								>
									{item.description}
								</ReactMarkdown>
							</FieldDescription>
						</div>
					</div>
				</FieldContent>
			</Field>
		</div>
	);
}
