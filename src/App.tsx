import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import { useAuthListener } from "@/hooks/useAuthListener";
import { useTeamListener } from "@/atoms/team";
import TeamManager from "./pages/TeamManager";
import ParticipantManager from "./pages/ParticipantManager";
import NotificationListener from "./components/NotificationListener";
import RFIDReader from "./pages/RFIDReader";
import Raffle from "./pages/Raffle";

function App() {
	useAuthListener();
	useTeamListener();

	return (
		<BrowserRouter>
			<div className="min-h-screen">
				<NotificationListener />

				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Home />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/teams"
						element={
							<ProtectedRoute>
								<TeamManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/participants"
						element={
							<ProtectedRoute>
								<ParticipantManager />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/rfid"
						element={
							<ProtectedRoute>
								<RFIDReader />
							</ProtectedRoute>
						}
					/>
					<Route
						path="/admin/raffle"
						element={
							<ProtectedRoute>
								<Raffle />
							</ProtectedRoute>
						}
					/>

					<Route path="/login" element={<Login />} />
					<Route path="/auth" element={<Auth />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</div>
		</BrowserRouter>
	);
}

export default App;
