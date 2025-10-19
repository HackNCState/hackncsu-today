import Countdown from "./Countdown";
import ResourcesList from "./ResourcesList";

export default function Home() {
	const resourcesLinks = [
		{ label: "Discord Server", href: "#" },
		{ label: "Opening Slides", href: "#" },
		{ label: "Third Item", href: () => alert("You clicked Third Item!") },
	];

	return (
		<div className="flex flex-col sm:flex-row items-stretch min-h-screen">
			<aside className="flex flex-col gap-6 p-6 sm:w-55">
				<Countdown />

				<ResourcesList items={resourcesLinks} />
			</aside>

			<main className="bg-blue-500 flex-1">
				<p>Main content area</p>
			</main>
		</div>
	);
}
