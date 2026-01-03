import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import Auth from "./pages/Auth";
import { useAuthListener } from "@/hooks/useAuthListener";
import { useTeamListener } from "@/atoms/team";

function App() {
	useAuthListener();
	useTeamListener();

	return (
		<BrowserRouter>
			<div className="min-h-screen">
				<Routes>
					<Route
						path="/"
						element={
							<ProtectedRoute>
								<Home />
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
