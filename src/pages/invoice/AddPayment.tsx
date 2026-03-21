import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getDoc, increment } from "firebase/firestore";
import {
  addDoc,
  collection,
  serverTimestamp,
  doc,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { getAuth } from "firebase/auth";
import { Box, Paper, Typography, TextField, Button } from "@mui/material";

export default function AddPayment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
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

    const invoiceRef = doc(db, "invoices", id!);
    const invoiceSnap = await getDoc(invoiceRef);

    if (!invoiceSnap.exists()) {
      alert("Invoice not found");
      return;
    }

    const invoiceData = invoiceSnap.data();

    const tripBillAmount = Number(invoiceData.totalPending || 0);
    // const prevPaid = Number(invoiceData.totalPaid || 0);
    const paidNow = Number(amount);

    const newTotalPaid = paidNow;
    const newTotalPending = Math.max(tripBillAmount - newTotalPaid, 0);

    let paymentStatus: "paid" | "partial" | "unpaid" = "unpaid";

    if (newTotalPending < 1) {
      paymentStatus = "paid";
      await markTripsAsPaid(invoiceData.items);
    } else if (newTotalPaid > 0) {
      paymentStatus = "partial";
    }

    // 1️⃣ Save payment
    await addDoc(collection(db, "payments"), {
      invoiceId: id,
      amountPaid: paidNow,
      paymentDate: finalPaymentDate,
      addedByUserId: user.uid,
      addedByUsername: user.displayName || user.email,
      addedAt: serverTimestamp(),
    });

    await updateDoc(invoiceRef, {
      totalPaid: increment(newTotalPaid), // ✅ add instead of overwrite
      totalPending: newTotalPending,
      paymentStatus,
      lastPaymentDate: finalPaymentDate,
    });

    navigate(`/invoice/${id}`);
  };

  const markTripsAsPaid = async (trips: any) => {
    for (const tripsInfo of trips) {
      await updateDoc(doc(db, "dailyTrips", tripsInfo.tripId), {
        paymentStatus: "Paid",
        paymentDate: serverTimestamp(),
      });
    }
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
          onChange={(e) => setAmount(e.target.value)}
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
