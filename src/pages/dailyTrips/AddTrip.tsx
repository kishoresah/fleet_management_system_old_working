import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";
import TripForm from "./TripForm";

export default function AddDailyTrip() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerId: "",
    localCustomerName: "",
    vehicleId: "", // selected vehicle
    vehicleNumber: "", // manual input
    tripExpense: "",
    tripCharges: "",
    tripCommission: "",
    tripGoods: "",
    driverId: "",
    fromLocation: "",
    toLocation: "",
    consignorGST: "",
    consigneeGST: "",
    createBilty: "No",
    lorryNo: "",
    addedBy: "",
    addedDate: "",
    specialNotes: "",
    addTripDate: "",
    paymentStatus: "unpaid",
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

  // Fetch vehicles
  useEffect(() => {
    getDocs(collection(db, "vehicles")).then((snap) =>
      setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  useEffect(() => {
    if (formData.createBilty !== "Yes") {
      setFormData((p) => ({ ...p, lorryNo: "" }));
      return;
    }

    const loadLorryNo = async () => {
      const snap = await getDocs(collection(db, "dailyTrips"));
      const all = snap.docs.map((d) => d.data());
      const maxNo = all.length
        ? Math.max(...all.map((t) => t.lorryNo || 1000))
        : 1000;

      setFormData((p) => ({
        ...p,
        lorryNo: maxNo + 1,
      }));
    };

    loadLorryNo();
  }, [formData.createBilty]);

  // Logged in user
  useEffect(() => {
    const user = auth.currentUser;
    setFormData((p) => ({
      ...p,
      addedBy: user?.email || "",
      paymentStatus: "unpaid",
      invoiceCreated: "no",
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
    }));
  };

  const handleVehicleChange = (e) => {
    const id = e.target.value;
    const selected = vehicles.find((v) => v.id === id);
    setFormData((p) => ({
      ...p,
      vehicleId: id,
      vehicleNumber: selected?.vehicleNumber || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // if (isSubmitting) return; // safety guard
    setIsSubmitting(true);

    try {
      console.log("Submitting form data:", formData);
      // Decide final vehicle number
      const finalVehicleNumber = formData.vehicleId
        ? vehicles.find((v) => v.id === formData.vehicleId)?.vehicleNumber
        : formData.vehicleNumber;

      try {
        const docRef = await addDoc(collection(db, "dailyTrips"), {
          ...formData,
          vehicleNumber: finalVehicleNumber,
          createdAt: serverTimestamp(),
        });

        console.log("Document written with ID:", docRef.id);
      } catch (error) {
        console.error("Error adding document:", error);
        // alert(error.message); // optional UI feedback
      }

      navigate("/trip-list");
    } catch (error) {
      console.error("Failed to save trip", error);
      setIsSubmitting(false); // re-enable if error
    }
  };

  return (
    <div className="add-customer-container">
      <h2>Add Daily Trip</h2>

      <TripForm
        formData={{ ...formData, vehicles }}
        isSubmitting={isSubmitting}
        customers={customers}
        drivers={drivers}
        onChange={handleChange}
        onCustomerChange={handleCustomerChange}
        onVehicleChange={handleVehicleChange} // new
        onSubmit={handleSubmit}
        submitText="Save Trip"
      />
    </div>
  );
}
