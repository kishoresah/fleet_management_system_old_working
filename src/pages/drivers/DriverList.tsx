import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function DriverList() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "drivers"));
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const deleteDriver = async (id: string) => {
    const userRole = localStorage.getItem("role");
    if (userRole !== "1") return alert("Only Admin can delete drivers");

    await deleteDoc(doc(db, "drivers", id));
    setDrivers(drivers.filter((c) => c.id !== id));
  };

  return (
    <div>
      <Button variant="contained" onClick={() => navigate("/add-driver")}>
        Add Driver
      </Button>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>City</TableCell>
            <TableCell>Phone</TableCell>
            <TableCell>State</TableCell>
            <TableCell>Salary</TableCell>
            <TableCell>Joining Date</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {drivers.map((d) => (
            <TableRow key={d.id}>
              <TableCell>{d.name}</TableCell>
              <TableCell>{d.city}</TableCell>
              <TableCell>{d.phone}</TableCell>
              <TableCell>{d.state}</TableCell>
              <TableCell>₹ {d.salary || "-"}</TableCell>
              <TableCell>
                {d.joiningDate
                  ? new Date(d.joiningDate.seconds * 1000).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => navigate(`/edit-driver/${d.id}`)}
                >
                  Edit
                </Button>{" "}
                <Button
                  size="small"
                  color="error"
                  onClick={() => deleteDriver(d.id)}
                >
                  Delete
                </Button>{" "}
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/driver-payments/${d.id}`)}
                >
                  View Payments
                </Button>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => navigate(`/add-driver-payment/${d.id}`)}
                >
                  Add Payment
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
