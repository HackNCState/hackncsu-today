import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDownIcon } from "lucide-react";
import { useId, useState } from "react";

interface HackingDatesPickerProps {
	startDate: Date | undefined;
	onStartDateChange: (date: Date | undefined) => void;
	endDate: Date | undefined;
	onEndDateChange: (date: Date | undefined) => void;
}

export default function HackingDatesPicker({
	startDate,
	onStartDateChange,
	endDate,
	onEndDateChange,
}: HackingDatesPickerProps) {
	const [startOpen, setStartOpen] = useState(false);
	const [endOpen, setEndOpen] = useState(false);

	const hackingStartDateId = useId();
	const hackingStartTimeId = useId();
	const hackingEndDateId = useId();
	const hackingEndTimeId = useId();

	const handleDateSelect = (
		date: Date | undefined,
		currentDate: Date | undefined,
		onChange: (date: Date | undefined) => void,
	) => {
		if (!date) {
			onChange(undefined);
			return;
		}

		const newDate = new Date(date);
		if (currentDate) {
			newDate.setHours(currentDate.getHours());
			newDate.setMinutes(currentDate.getMinutes());
			newDate.setSeconds(currentDate.getSeconds());
		} else {
			newDate.setHours(11, 0, 0); // Default to 11:00 AM
		}
		onChange(newDate);
	};

	const handleTimeChange = (
		e: React.ChangeEvent<HTMLInputElement>,
		currentDate: Date | undefined,
		onChange: (date: Date | undefined) => void,
	) => {
		if (!currentDate) return;
		const [hours, minutes, seconds] = e.target.value.split(":").map(Number);
		const newDate = new Date(currentDate);
		newDate.setHours(hours);
		newDate.setMinutes(minutes);
		newDate.setSeconds(seconds || 0);
		onChange(newDate);
	};

	const formatTime = (date: Date | undefined) => {
		if (!date) return "11:00:00";
		return date.toLocaleTimeString("en-GB", { hour12: false });
	};

	return (
		<div className="flex flex-wrap gap-4">
			<div className="flex flex-col gap-2">
				<Label>Hacking Start</Label>

				<div className="flex flex-row gap-2">
					<Popover open={startOpen} onOpenChange={setStartOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								id={hackingStartDateId}
								className="w-32 justify-between font-normal"
							>
								{startDate ? startDate.toLocaleDateString() : "Select date"}
								<ChevronDownIcon />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="start"
						>
							<Calendar
								mode="single"
								selected={startDate}
								captionLayout="dropdown"
								onSelect={(date) => {
									handleDateSelect(date, startDate, onStartDateChange);
									setStartOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>

					<Input
						type="time"
						id={hackingStartTimeId}
						step="1"
						value={formatTime(startDate)}
						onChange={(e) => handleTimeChange(e, startDate, onStartDateChange)}
						className="w-min bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
				</div>
			</div>

			<div className="flex flex-col gap-2">
				<Label>Hacking End</Label>

				<div className="flex flex-row gap-2">
					<Popover open={endOpen} onOpenChange={setEndOpen}>
						<PopoverTrigger asChild>
							<Button
								variant="outline"
								id={hackingEndDateId}
								className="w-32 justify-between font-normal"
							>
								{endDate ? endDate.toLocaleDateString() : "Select date"}
								<ChevronDownIcon />
							</Button>
						</PopoverTrigger>

						<PopoverContent
							className="w-auto overflow-hidden p-0"
							align="start"
						>
							<Calendar
								mode="single"
								selected={endDate}
								captionLayout="dropdown"
								onSelect={(date) => {
									handleDateSelect(date, endDate, onEndDateChange);
									setEndOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>

					<Input
						type="time"
						id={hackingEndTimeId}
						step="1"
						value={formatTime(endDate)}
						onChange={(e) => handleTimeChange(e, endDate, onEndDateChange)}
						className="w-min bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
					/>
				</div>
			</div>
		</div>
	);
}
