import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Box,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

interface DriverPayment {
  id: string;
  driverId: string;
  amount: number;
  paymentDate: any;
  paidBy: string;
  comments?: string;
}

export default function DriverPaymentList() {
  const [payments, setPayments] = useState<DriverPayment[]>([]);
  const [drivers, setDrivers] = useState<Record<string, string>>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "driverPayments"));
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as DriverPayment[];
      setPayments(list);
      console.log("Driver Payments:", list);

      // Fetch driver names for display
      const driverSnap = await getDocs(collection(db, "drivers"));
      const driverMap: Record<string, string> = {};
      driverSnap.forEach((d) => {
        driverMap[d.id] = (d.data() as any).name;
      });
      setDrivers(driverMap);
    };

    fetchData();
  }, []);

  const deletePayment = async (id: string) => {
    const userRole = localStorage.getItem("role");
    if (userRole != "1") return alert("Only Admin can delete driver payments");

    await deleteDoc(doc(db, "driverPayments", id));
    setPayments(payments.filter((p) => p.id !== id));
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Driver Payments
      </Typography>

      <Button
        variant="contained"
        color="primary"
        onClick={() => navigate("/add-driver-payment")}
      >
        + Add Driver Payment
      </Button>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Driver Name</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Payment Date</TableCell>
            <TableCell>Paid By</TableCell>
            <TableCell>Comments</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {payments.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{drivers[p.driverId] || "Unknown"}</TableCell>
              <TableCell>₹ {p.amount}</TableCell>
              <TableCell>
                {p.paymentDate?.toDate
                  ? p.paymentDate.toDate().toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>{p.paidBy}</TableCell>
              <TableCell>{p.comments || "-"}</TableCell>
              <TableCell>
                <Button
                  size="small"
                  color="error"
                  onClick={() => deletePayment(p.id)}
                >
                  Delete
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
