import Schedule from "./Schedule";
import Nav from "./Nav";
import Main from "./Main";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";

export default function Home() {
	const isOnline = useOnlineStatus();

	return (
		<div className="flex flex-col sm:flex-row items-stretch min-h-screen sm:h-screen sm:overflow-hidden">
			{!isOnline && (
				<div className="fixed top-0 left-0 right-0 z-50 bg-red-800 text-white text-center py-1 text-sm font-medium">
					You are offline. Data may be outdated and some features may not work.
				</div>
			)}

			<header className="sr-only">
				<h1>Hack_NCState Today</h1>
				<h2>
					Welcome to Hack_NCState 2026! Your real-time event dashboard is here.
				</h2>
			</header>

			<Nav />

			<div className="flex-1 flex flex-col lg:flex-row sm:overflow-y-auto lg:overflow-hidden sm:border-x ">
				<Main />

				<Schedule />
			</div>
		</div>
	);
}
