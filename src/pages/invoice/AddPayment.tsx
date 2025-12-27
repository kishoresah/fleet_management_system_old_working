import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  increment,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getAuth } from "firebase/auth";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function AddPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");

  const submitPayment = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("You must be logged in to record a payment.");
      return;
    }

    const finalPaymentDate = paymentDate
      ? Timestamp.fromDate(new Date(paymentDate))
      : serverTimestamp();

    await addDoc(collection(db, "payments"), {
      invoiceId: id,
      amountPaid: Number(amount),
      paymentDate: finalPaymentDate,
      addedByUserId: user.uid,
      addedByUsername: user.displayName || user.email,
      addedAt: serverTimestamp(),
    });

    const invoiceRef = doc(db, "invoices", id!);
    await updateDoc(invoiceRef, {
      totalPaid: increment(Number(amount)),
      totalPending: increment(-Number(amount)),
      paymentStatus:
        Number(amount) > 0
          ? increment(Number(amount)) == 0
            ? "paid"
            : "partial"
          : "unpaid",
      lastPaymentDate: finalPaymentDate,
    });

    navigate(`/invoice/${id}`);
  };

  return (
    <Box
      sx={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Paper sx={{ p: 4, width: 400 }} elevation={3}>
        <Typography variant="h5" textAlign="center" mb={3}>
          Add Payment
        </Typography>

        <TextField
          label="Amount Paid"
          type="number"
          fullWidth
          margin="normal"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />

        <TextField
          label="Payment Date (optional)"
          type="date"
          fullWidth
          margin="normal"
          value={paymentDate}
          onChange={(e) => setPaymentDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          onClick={submitPayment}
        >
          Save Payment
        </Button>
      </Paper>
    </Box>
  );
}
