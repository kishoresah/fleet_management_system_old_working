import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import TripForm from "./TripForm";

export default function EditDailyTrip() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [formData, setFormData] = useState(null);

  // Load customers + drivers
  useEffect(() => {
    getDocs(collection(db, "customers")).then((snap) =>
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    getDocs(collection(db, "drivers")).then((snap) =>
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
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

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCustomerChange = (e) => {
    const cid = e.target.value;
    const selected = customers.find((c) => c.id === cid);

    setFormData((p) => ({
      ...p,
      customerId: cid,
      consignorGST: selected?.gstNumber || "",
      consigneeGST: selected?.gstNumber || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateDoc(doc(db, "dailyTrips", id), formData);
    navigate("/trip-list");
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div className="add-customer-container">
      <h2>Edit Daily Trip</h2>

      <TripForm
        formData={formData}
        customers={customers}
        drivers={drivers}
        onChange={handleChange}
        onCustomerChange={handleCustomerChange}
        onSubmit={handleSubmit}
        submitText="Update Trip"
      />
    </div>
  );
}
