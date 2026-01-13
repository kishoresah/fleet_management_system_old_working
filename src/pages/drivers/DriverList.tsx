import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfigTest";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { formatDateMMDDYYYY } from "../../utils";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

export default function DriverList() {
  const [drivers, setDrivers] = useState<any[]>([]);
  const navigate = useNavigate();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteDriverId, setDeleteDriverId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "drivers"));
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const deleteDriver = async (id: string) => {
    if (!id) return;
    await deleteDoc(doc(db, "drivers", id));
    setDrivers(drivers.filter((c) => c.id !== id));
  };

  const handleDeleteClick = (id) => {
    //const role = localStorage.getItem("role");
    setDeleteDriverId(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteDriver = async () => {
    try {
      deleteDriver(deleteDriverId);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete trip");
    } finally {
      setShowDeleteModal(false);
      setDeleteDriverId(null);
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteDriverId(null);
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
                  ? formatDateMMDDYYYY(
                      new Date(d.joiningDate).toLocaleDateString()
                    )
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
                  onClick={() => handleDeleteClick(d.id)}
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

      <DeleteConfirmModal
        open={showDeleteModal}
        title="Delete Driver"
        message="Are you sure you want to delete this Driver? This action cannot be undone."
        onConfirm={confirmDeleteDriver}
        onCancel={cancelDelete}
      />
    </div>
  );
}
