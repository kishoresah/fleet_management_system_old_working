import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import TripForm from "./TripForm";

export default function AddDailyTrip() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [formData, setFormData] = useState({
    customerId: "",
    driverId: "",
    fromLocation: "",
    toLocation: "",
    consignorGST: "",
    consigneeGST: "",
    invoiceValue: "",
    createBilty: "No",
    lorryNo: "",
    addedBy: "",
    addedDate: "",
  });

  // Fetch customers
  useEffect(() => {
    getDocs(collection(db, "customers")).then((snap) =>
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // Fetch drivers
  useEffect(() => {
    getDocs(collection(db, "drivers")).then((snap) =>
      setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  // Auto increment lorryNo
  useEffect(() => {
    const load = async () => {
      const snap = await getDocs(collection(db, "dailyTrips"));
      const all = snap.docs.map((d) => d.data());
      const maxNo = all.length
        ? Math.max(...all.map((t) => t.lorryNo || 0))
        : 1000;
      setFormData((p) => ({ ...p, lorryNo: maxNo + 1 }));
    };
    load();
  }, []);

  // Logged in user
  useEffect(() => {
    const user = auth.currentUser;
    setFormData((p) => ({
      ...p,
      addedBy: user?.email || "",
      addedDate: new Date().toLocaleString(),
    }));
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCustomerChange = (e) => {
    const id = e.target.value;
    const selected = customers.find((c) => c.id === id);
    setFormData((p) => ({
      ...p,
      customerId: id,
      consignorGST: selected?.gstNumber || "",
      consigneeGST: selected?.gstNumber || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addDoc(collection(db, "dailyTrips"), {
      ...formData,
      createdAt: serverTimestamp(),
    });
    navigate("/trip-list");
  };

  return (
    <div className="add-customer-container">
      <h2>Add Daily Trip</h2>

      <TripForm
        formData={formData}
        customers={customers}
        drivers={drivers}
        onChange={handleChange}
        onCustomerChange={handleCustomerChange}
        onSubmit={handleSubmit}
        submitText="Save Trip"
      />
    </div>
  );
}
