import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  getDocs,
  collection,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate, useParams } from "react-router-dom";
import type Invoice from "../../types/Invoice";
import InvoiceForm from "./InvoiceForm";

const EditInvoice = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [customers, setCustomers] = useState<any[]>([]);
  const [formData, setFormData] = useState<Invoice | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const docSnap = await getDoc(doc(db, "invoices", id!));
      const custSnap = await getDocs(collection(db, "customers"));
      setCustomers(
        custSnap.docs.map((d) => ({
          id: d.id,
          name: d.data().name,
          gst: d.data().gstNumber || "",
        }))
      );
      if (docSnap.exists()) setFormData(docSnap.data() as Invoice);
    };
    loadData();
  }, [id]);

  const onChange = (e: any) => {
    const value =
      e.target.name === "isGST" ? e.target.value === "yes" : e.target.value;
    setFormData((prev: any) => ({ ...prev, [e.target.name]: value }));
  };

  const onItemChange = (i: number, field: string, value: any) => {
    const items = [...(formData?.items || [])];
    items[i][field] = value;
    items[i].total = items[i].price;
    setFormData({ ...formData!, items });
  };

  const addItem = () =>
    setFormData({
      ...formData!,
      items: [
        ...(formData?.items || []),
        { description: "", quantity: 1, price: 0, total: 0 },
      ],
    });

  const removeItem = (i: number) =>
    setFormData({
      ...formData!,
      items: formData!.items.filter((_, idx) => idx !== i),
    });

  const calculateTotals = () => {
    const subtotal = formData!.items.reduce((sum, i) => sum + i.total, 0);
    const gstAmount = formData!.isGST
      ? (subtotal * (formData!.gstRate || 18)) / 100
      : 0;
    const finalTotal = subtotal + gstAmount;
    setFormData({ ...formData!, subtotal, gstAmount, finalTotal });
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    calculateTotals();
    await updateDoc(doc(db, "invoices", id!), formData!);
    navigate("/invoices");
  };

  if (!formData) return <p>Loading...</p>;

  return (
    <div>
      <h2>Edit Invoice</h2>
      <InvoiceForm
        formData={formData}
        customers={customers}
        onChange={onChange}
        onItemChange={onItemChange}
        addItem={addItem}
        removeItem={removeItem}
        calculateTotals={calculateTotals}
        onSubmit={onSubmit}
        submitText="Update Invoice"
      />
    </div>
  );
};

export default EditInvoice;
