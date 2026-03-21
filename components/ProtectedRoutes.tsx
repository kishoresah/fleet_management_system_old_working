import { Navigate } from "react-router-dom";
import { auth } from "../firebaseConfigTest";
//import { useAuthState } from "react-firebase-hooks/auth";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  // const [user] = useAuthState(auth);
  // return user ? children : <Navigate to="/login" />;
  return auth.currentUser ? children : <Navigate to="/login" />;
}
