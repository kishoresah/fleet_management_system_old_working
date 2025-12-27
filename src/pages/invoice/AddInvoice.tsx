import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  setDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import type Invoice from "../../types/Invoice";
import InvoiceForm from "./InvoiceForm";
import { doc, runTransaction } from "firebase/firestore";
import { makeAllCaps } from "../../utils";

const AddInvoice = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    customerName: "",
    vechileNumber: "",
    isGST: false,
    items: [{ description: "", quantity: 1, price: 0, total: 0 }],
    subtotal: 0,
    finalTotal: 0,
    paymentStatus: "unpaid", // NEW
  });

  useEffect(() => {
    const load = async () => {
      const data = await getDocs(collection(db, "customers"));
      setCustomers(
        data.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          gst: d.data().gst,
        }))
      );
    };
    load();
  }, []);

  const onChange = (e: any) => {
    let value =
      e.target.name === "isGST" ? e.target.value === "yes" : e.target.value;

    if (e.target.name == "vechileNumber") {
      value = makeAllCaps(value);
    }

    setFormData({ ...formData, [e.target.name]: value });
  };

  const onItemChange = (i: number, field: string, value: any) => {
    const items = [...formData.items];
    items[i][field] = value;
    items[i].total = items[i].price;
    setFormData({ ...formData, items });
  };

  const addItem = () =>
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        { description: "", quantity: 1, price: 0, total: 0 },
      ],
    });
  const removeItem = (i: number) =>
    setFormData({
      ...formData,
      items: formData.items.filter((_, idx) => idx !== i),
    });
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.total, 0);
    const finalTotal = subtotal;
    const amountPending = subtotal;

    setFormData((prev) => ({
      ...prev,
      subtotal,
      finalTotal,
      amountPending,
    }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotals();

    try {
      const counterRef = doc(db, "settings", "invoiceCounter");

      const lorryNo = await runTransaction(db, async (transaction) => {
        const counterDoc = await transaction.get(counterRef);
        let newNumber = 1000;
        if (counterDoc.exists()) {
          newNumber = (counterDoc.data().lorryNo || 1000) + 1;
        }
        transaction.set(counterRef, { lorryNo: newNumber }, { merge: true });
        return newNumber;
      });

      await addDoc(collection(db, "invoices"), {
        ...formData,
        totalPaid: 0, // start 0
        totalPending: formData.finalTotal,
        paymentStatus: "unpaid",
        lorryNo,
        createdAt: serverTimestamp(),
      });

      navigate("/invoices");
    } catch (err) {
      console.error("Failed to generate invoice number:", err);
    }
  };

  return (
    <div>
      <h2>Create Invoice</h2>
      <InvoiceForm
        formData={formData}
        customers={customers}
        onChange={onChange}
        onItemChange={onItemChange}
        addItem={addItem}
        removeItem={removeItem}
        calculateTotals={calculateTotals}
        onSubmit={onSubmit}
        submitText="Save Invoice"
      />
    </div>
  );
};

export default AddInvoice;
