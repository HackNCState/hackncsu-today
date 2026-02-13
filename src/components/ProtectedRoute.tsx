import { Navigate } from "react-router-dom";
import { useAtomValue } from "jotai";
import { userAtom } from "@/atoms/user";

interface ProtectedRouteProps {
	children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const user = useAtomValue(userAtom);
	const loading = user === undefined;

	if (loading) {
		return null;
	}

	if (!user) {
		return <Navigate to="/login" replace />;
	}

	return <>{children}</>;
}
