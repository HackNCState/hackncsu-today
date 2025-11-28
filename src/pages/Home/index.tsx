import { MenuIcon } from "lucide-react";
import Countdown from "./Countdown";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import ResourcesSection from "./ResourcesSection";
import { authService } from "@/services/auth.service";

export default function Home() {
	const sampleResourcesSection = [
		{
			title: "Resources",
			items: [
				{
					label: "Rules",
					href: "#",
				},
				{
					label: "Tracks",
					href: "#",
				},
				{
					label: "Opening Slides",
					href: "#",
				},
				{
					label: "Judging Criteria",
					href: "#",
				},
			],
		},
		{
			title: "Quick Links",
			items: [
				{
					label: "Discord Server",
					href: "#",
				},
				{
					label: "Catering Menu",
					href: "#",
				},
			],
		},
		{
			title: "System",
			items: [
				{
					label: "Log out",
					href: () => authService.logout(),
				},
				{
					label: "About",
					href: () => alert("HackNC 2024 - Powered by NC State University"),
				},
			],
		},
	];

	return (
		<div className="flex flex-col sm:flex-row items-stretch min-h-screen">
			<header className="sr-only">
				<h1>Hack_NCState Today</h1>
				<h2>
					Welcome to Hack_NCState 2026! Your real-time event dashboard is here.
				</h2>
			</header>

			<aside className="flex flex-col gap-6 p-6 sm:w-55">
				<div className="flex flex-row w-full justify-between items-start">
					<Countdown />

					<Sheet>
						<SheetTrigger className="sm:hidden hover:text-primary transition-colors">
							<MenuIcon />
						</SheetTrigger>

						<SheetContent side="top" className="p-6">
							<SheetHeader className="sr-only">
								<SheetTitle>Resources</SheetTitle>
								<SheetDescription>
									Quick access to important links and information.
								</SheetDescription>
							</SheetHeader>

							<ResourcesSection sections={sampleResourcesSection} />
						</SheetContent>
					</Sheet>
				</div>

				<div className="hidden sm:flex flex-col gap-6">
					<ResourcesSection sections={sampleResourcesSection} />
				</div>
			</aside>

			<main className="bg-blue-500 flex-1">
				<p>Main content area</p>
			</main>
		</div>
	);
}
