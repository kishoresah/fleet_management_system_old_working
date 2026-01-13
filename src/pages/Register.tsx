import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfigTest";
import { Link, useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { collection, doc, setDoc } from "firebase/firestore";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const [role, setRole] = useState(""); // <-- selected role

  const users = [
    { uid: "admin", displayName: "Admin" },
    { uid: "subadmin", displayName: "SubAdmin" },
  ];

  const register = async () => {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("Registered user:", user);

    try {
      await setDoc(doc(collection(db, "users"), user.uid), {
        uid: user.uid,
        email,
        role, // <-- store selected role
        createdAt: new Date(),
      });

      alert("User registered successfully ✅");
    } catch (err: any) {
      console.error(err.message + " there is some error occurred");
    }

    navigate("/");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f6fa",
      }}
    >
      <Paper elevation={4} sx={{ p: 4, width: 350, borderRadius: 3 }}>
        <Typography variant="h5" textAlign="center" mb={2}>
          Create Account
        </Typography>

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

        <FormControl fullWidth margin="normal" size="small">
          <InputLabel id="role-label">Select Role</InputLabel>
          <Select
            labelId="role-label"
            value={role}
            label="Select Role"
            onChange={(e) => setRole(e.target.value)}
          >
            <MenuItem value="">
              <em>-- Select Role --</em>
            </MenuItem>
            {users.map((u) => (
              <MenuItem key={u.uid} value={u.uid}>
                {u.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={register}>
          Sign Up
        </Button>

        <Typography variant="body2" textAlign="center" mt={2}>
          <Link to="/login">Already have an account? Sign In</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
