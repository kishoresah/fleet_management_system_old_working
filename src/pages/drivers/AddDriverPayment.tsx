import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
} from "@mui/material";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";

const AddDriverPayment: React.FC = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    amount: "",
    paymentDate: "",
    paidBy: "",
    comments: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.amount || !formData.paymentDate || !formData.paidBy) {
      alert("Please fill all required fields");
      return;
    }

    const user = auth.currentUser;
    const loggedInUser = user?.email || "Unknown User";

    setLoading(true);
    try {
      await addDoc(collection(db, "driverPayments"), {
        driverId,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate,
        paidBy: formData.paidBy,
        loggedInUser: loggedInUser,
        comments: formData.comments || "",
        createdAt: serverTimestamp(),
      });
      alert("Payment added successfully ✅");
      navigate("/drivers");
    } catch (error) {
      console.error("Error adding payment:", error);
      alert("Error adding payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper
      elevation={3}
      sx={{
        p: 4,
        mt: 4,
        maxWidth: 500,
        mx: "auto",
        borderRadius: 3,
      }}
    >
      <Typography variant="h6" gutterBottom>
        Add Payment for Driver
      </Typography>

      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <TextField
            label="Amount (₹)"
            name="amount"
            type="number"
            value={formData.amount}
            onChange={handleChange}
            required
          />

          <TextField
            label="Payment Date"
            name="paymentDate"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={formData.paymentDate}
            onChange={handleChange}
            required
          />

          <TextField
            label="Paid By"
            name="paidBy"
            value={formData.paidBy}
            onChange={handleChange}
            required
          />

          <TextField
            label="Comments"
            name="comments"
            multiline
            rows={3}
            value={formData.comments}
            onChange={handleChange}
          />

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => navigate("/drivers")}
            >
              Cancel
            </Button>

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Saving..." : "Save Payment"}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default AddDriverPayment;
