import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebaseConfigTest";
import { Link, useNavigate } from "react-router-dom";
import { TextField, Button, Typography } from "@mui/material";
import "../styles/auth.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const login = async () => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
    navigate("/");
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <Typography className="auth-title">Sign In</Typography>

        <TextField
          label="Email"
          fullWidth
          margin="normal"
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button
          variant="contained"
          fullWidth
          className="auth-btn"
          onClick={login}
        >
          Login
        </Button>
      </div>
    </div>
  );
}
