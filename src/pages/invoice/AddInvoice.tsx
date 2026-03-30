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
import TripForm from "../dailyTrips/TripForm";
import BackButton from "../../components/Back";

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
        })),
      );
    };

    loadCustomers();
  }, []);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    const finalValue = name === "isGST" ? value === "yes" : value;

    let selectedCustomer = null;

    if (name === "customerName") {
      selectedCustomer = customers.find((c) => c.id === value);
      console.log("Selected customer:", selectedCustomer);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
      ...(name === "customerName" && {
        customerSelectedName: selectedCustomer?.name || "",
      }),
    }));
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

      console.log("formData kishor :", formData);
      const totalPending = formData?.items?.reduce(
        (sum, item) => sum + Number(item.total),
        0,
      );
      const advanceAmount = formData?.items?.reduce(
        (sum, item) => sum + Number(item.advanceAmount),
        0,
      );
      const totalPrice = formData?.items?.reduce(
        (sum, item) => sum + Number(item.price),
        0,
      );

      const obj = {
        ...formData,
        advanceAmount: Number(advanceAmount) || 0,
        tripBillAmount: Number(totalPrice) || 0,
        totalPaid: Number(advanceAmount) || 0,
        totalPending: Number(totalPending) || 0,
        paymentStatus: "unpaid",
        lorryNo,
        createdAt: serverTimestamp(),
      };
      console.log("Saving invoice:", obj);

      const docRef = await addDoc(collection(db, "invoices"), obj);

      await markTripsAsInvoiced(docRef.id);
      navigate("/invoices");
    } catch (error) {
      console.error("Failed to save invoice:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const markTripsAsInvoiced = async (invoiceId: string) => {
    for (const tripId of selectedTrips) {
      await updateDoc(doc(db, "dailyTrips", tripId), {
        invoiceCreated: "yes",
        invoiceId,
      });
    }
  };

  return (
    <div>
      <BackButton className="primary-blue-btn" />
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
