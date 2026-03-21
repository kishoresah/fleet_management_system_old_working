import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import type Vehicle from "../../types/Vehicle";
import { formatDateMMDDYYYY } from "../../utils";

interface VehicleWithId extends Vehicle {
  id: string;
}

export default function VehicleList() {
  const [vehicles, setVehicles] = useState<VehicleWithId[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "vehicles"));
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Vehicle),
      }));
      setVehicles(data);
    };

    fetchData();
  }, []);

  const isExpired = (date?: Date) => {
    if (!date) return false;
    return new Date(date).getTime() < new Date().setHours(0, 0, 0, 0);
  };

  const deleteVehicle = async (id: string) => {
    const role = localStorage.getItem("role");
    if (role !== "1") {
      alert("Only Admin can delete vehicles");
      return;
    }

    await deleteDoc(doc(db, "vehicles", id));
    setVehicles((prev) => prev.filter((v) => v.id !== id));
  };

  const isExpiringSoon = (date?: Date) => {
    if (!date) return false;
    const now = new Date().setHours(0, 0, 0, 0);
    const diffDays = (new Date(date).getTime() - now) / (1000 * 60 * 60 * 24);
    return diffDays > 0 && diffDays <= 7;
  };

  return (
    <div>
      <Button variant="contained" onClick={() => navigate("/add-vehicle")}>
        Add Vehicle
      </Button>

      <Table sx={{ mt: 3 }}>
        <TableHead>
          <TableRow>
            <TableCell>Vehicle No</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Brand</TableCell>
            <TableCell>Model</TableCell>
            <TableCell>Pollution Expiry</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {vehicles.map((v) => {
            const pollutionExpired = isExpired(v.pollutionExpiry);
            const insuranceExpired = isExpired(v.insuranceExpiry);
            const fitnessExpired = isExpired(v.fitnessExpiry);
            const permitExpired = isExpired(v.permitExpiry);

            const pollutionSoon =
              !pollutionExpired && isExpiringSoon(v.pollutionExpiry);
            const insuranceSoon =
              !insuranceExpired && isExpiringSoon(v.insuranceExpiry);
            const fitnessSoon =
              !fitnessExpired && isExpiringSoon(v.fitnessExpiry);
            const permitSoon = !permitExpired && isExpiringSoon(v.permitExpiry);

            const isAnyExpired =
              pollutionExpired ||
              insuranceExpired ||
              fitnessExpired ||
              permitExpired;

            return (
              <TableRow
                key={v.id}
                sx={{
                  backgroundColor:
                    pollutionExpired ||
                    insuranceExpired ||
                    fitnessExpired ||
                    permitExpired
                      ? "#fdecea" // RED for expired
                      : pollutionSoon ||
                        insuranceSoon ||
                        fitnessSoon ||
                        permitSoon
                      ? "#fff4e5" // YELLOW for expiring soon
                      : "inherit",
                }}
              >
                <TableCell>{v.vehicleNumber}</TableCell>
                <TableCell>{v.vehicleType}</TableCell>
                <TableCell>{v.brand}</TableCell>
                <TableCell>{v.model}</TableCell>

                <TableCell>
                  {v.pollutionExpiry
                    ? formatDateMMDDYYYY(
                        new Date(v.pollutionExpiry).toLocaleDateString()
                      )
                    : "-"}
                </TableCell>

                <TableCell>
                  {pollutionExpired && "Pollution Expired "}
                  {insuranceExpired && "Insurance Expired "}
                  {fitnessExpired && "Fitness Expired "}
                  {permitExpired && "Permit Expired "}

                  {pollutionSoon && "Pollution Expiring Soon "}
                  {insuranceSoon && "Insurance Expiring Soon "}
                  {fitnessSoon && "Fitness Expiring Soon "}
                  {permitSoon && "Permit Expiring Soon "}
                </TableCell>

                <TableCell>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => navigate(`/edit-vehicle/${v.id}`)}
                  >
                    Edit
                  </Button>{" "}
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteVehicle(v.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
