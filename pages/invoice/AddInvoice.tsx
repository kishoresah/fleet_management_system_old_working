import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc,
  runTransaction,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";
import InvoiceForm from "./InvoiceForm";

const AddInvoice = () => {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedTrips, setSelectedTrips] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    isGST: false,
    subtotal: 0,
    finalTotal: 0,
  });

  useEffect(() => {
    const loadCustomers = async () => {
      const data = await getDocs(collection(db, "customers"));
      setCustomers(
        data.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          gst: d.data().gst,
        }))
      );
    };

    loadCustomers();
  }, []);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.name === "isGST" ? e.target.value === "yes" : e.target.value;

    setFormData((prev) => ({ ...prev, [e.target.name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Generate invoice number
      const counterRef = doc(db, "settings", "invoiceCounter");

      const lorryNo = await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(counterRef);
        const newNumber = snap.exists()
          ? (snap.data().lorryNo || 1000) + 1
          : 1001;

        transaction.set(counterRef, { lorryNo: newNumber }, { merge: true });
        return newNumber;
      });

      const obj = {
        ...formData,
        subtotal: Number(formData.subtotal) || 0,
        finalTotal: Number(formData.finalTotal) || 0,
        totalPaid: 0,
        totalPending: Number(formData.finalTotal) || 0,
        paymentStatus: "unpaid",
        lorryNo,
        createdAt: serverTimestamp(),
      };
      console.log("Saving invoice:", obj);

      await addDoc(collection(db, "invoices"), obj);

      await markTripsAsInvoiced();
      navigate("/invoices");
    } catch (error) {
      console.error("Failed to save invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markTripsAsInvoiced = async () => {
    for (const tripId of selectedTrips) {
      await updateDoc(doc(db, "dailyTrips", tripId), {
        invoiceCreated: "yes",
      });
    }
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <InvoiceForm
        formData={formData}
        customers={customers}
        onChange={onChange}
        onSubmit={onSubmit}
        submitText="Save Invoice"
        selectedTrips={selectedTrips}
        setSelectedTrips={setSelectedTrips}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default AddInvoice;
