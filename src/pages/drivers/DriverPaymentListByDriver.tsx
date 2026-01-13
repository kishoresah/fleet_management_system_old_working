import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { formatDateMMDDYYYY } from "../../utils";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Button,
  Box,
} from "@mui/material";

export default function DriverPaymentListByDriver() {
  const { driverId } = useParams<{ driverId: string }>();
  const [driver, setDriver] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchDriverAndPayments = async () => {
      if (!driverId) return;

      // Fetch driver info
      const driverDoc = await getDoc(doc(db, "drivers", driverId));
      if (driverDoc.exists()) setDriver(driverDoc.data());

      // Fetch that driver's payments
      const q = query(
        collection(db, "driverPayments"),
        where("driverId", "==", driverId)
      );
      const snap = await getDocs(q);
      setPayments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };

    fetchDriverAndPayments();
  }, [driverId]);

  console.log("Payments:", payments);

  const deletePayment = async (id: string) => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "1") return alert("Only Admin can delete payments");
    await deleteDoc(doc(db, "driverPayments", id));
    setPayments(payments.filter((p) => p.id !== id));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Driver Payments - {driver?.name || "Loading..."}
      </Typography>

      <Button
        variant="contained"
        onClick={() => window.history.back()}
        sx={{ mb: 2 }}
      >
        Back
      </Button>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Amount</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Paid By</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>₹ {p.amount}</TableCell>
              <TableCell>
                {p.paymentDate ? formatDateMMDDYYYY(p.paymentDate) : "-"}
              </TableCell>
              <TableCell>{p.paidBy}</TableCell>
              <TableCell>{p.comments || "-"}</TableCell>
              <TableCell>
                <Button color="error" onClick={() => deletePayment(p.id)}>
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {payments.length === 0 && (
        <Typography sx={{ mt: 2 }}>
          No payments found for this driver.
        </Typography>
      )}
    </Box>
  );
}
