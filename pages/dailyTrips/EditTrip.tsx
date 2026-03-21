import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate, useParams } from "react-router-dom";
import TripForm from "./TripForm";

export default function EditDailyTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [formData, setFormData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load customers, drivers, vehicles
  useEffect(() => {
    getDocs(collection(db, "customers")).then((snap) =>
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "drivers")).then((snap) =>
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "vehicles")).then((snap) =>
      setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // Load trip details
  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "dailyTrips", id));
      if (snap.exists()) setFormData(snap.data());
    };
    load();
  }, [id]);

  // Handle generic input changes
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // Handle customer select
  const handleCustomerChange = (e) => {
    const cid = e.target.value;
    const selected = customers.find((c) => c.id === cid);
    setFormData((p) => ({
      ...p,
      customerId: cid,
      consignorGST: selected?.gstNumber || "",
    }));
  };

  // Handle vehicle select
  const handleVehicleChange = (e) => {
    const vid = e.target.value;
    const selected = vehicles.find((v) => v.id === vid);
    setFormData((p) => ({
      ...p,
      vehicleId: vid,
      vehicleNumber: selected?.vehicleNumber || "",
    }));
  };

  // Submit updated trip
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // safety guard
    setIsSubmitting(true);

    try {
      // Use selected vehicle if dropdown chosen, else manual input
      const finalVehicleNumber = formData.vehicleId
        ? vehicles.find((v) => v.id === formData.vehicleId)?.vehicleNumber
        : formData.vehicleNumber;

      await updateDoc(doc(db, "dailyTrips", id), {
        ...formData,
        vehicleNumber: finalVehicleNumber,
      });

      navigate("/trip-list");
    } catch (error) {
      console.error("Failed to save trip", error);
      setIsSubmitting(false); // re-enable if error
    }
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div className="add-customer-container">
      <h2>Edit Daily Trip</h2>

      <TripForm
        formData={{ ...formData, vehicles }}
        isSubmitting={isSubmitting}
        customers={customers}
        drivers={drivers}
        onChange={handleChange}
        onCustomerChange={handleCustomerChange}
        onVehicleChange={handleVehicleChange}
        onSubmit={handleSubmit}
        submitText="Update Trip"
      />
    </div>
  );
}
