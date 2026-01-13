import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc as firestoreDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ListInvoices: React.FC = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadInvoices = async () => {
      const q = query(collection(db, "invoices"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

      // Sort by lorryNo (numeric)
      data.sort((a, b) => Number(a.lorryNo || 0) - Number(b.lorryNo || 0));

      setInvoices(data);
    };
    loadInvoices();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this invoice?"))
      return;
    await deleteDoc(firestoreDoc(db, "invoices", id));
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const filteredInvoices = invoices.filter((inv) =>
    `${inv.lorryNo} ${inv.customerName} ${inv.finalTotal}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const getInvoice = (invoice: any) => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("SKYPORT CARGO & LOGISTICS", 14, 15);
    autoTable(doc, {
      startY: 30,
      head: [["Description", "Qty", "Price", "Total"]],
      body: invoice.items.map((item: any) => [
        item.description,
        item.quantity,
        item.price,
        item.total,
      ]),
    });
    doc.save(`Invoice_${invoice.lorryNo}.pdf`);
  };

  return (
    <div className="page-container">
      <h2>Invoices</h2>

      <button className="add-btn" onClick={() => navigate("/add-invoice")}>
        + Add Invoice
      </button>

      {/* 🔍 Search Box */}
      <input
        type="text"
        placeholder="Search by Lorry No, Customer, Amount..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ marginTop: 15, marginBottom: 15, padding: 8, width: "50%" }}
      />

      <table className="styled-table">
        <thead>
          <tr>
            <th style={{ fontWeight: "bold" }}>Lorry No</th>
            <th style={{ fontWeight: "bold" }}>Customer</th>
            <th style={{ fontWeight: "bold" }}>Invoice Total</th>
            <th style={{ fontWeight: "bold" }}>Vechile Number</th>
            <th>Status</th>
            <th>Paid</th>
            <th>Pending</th>
            <th>Next Payment</th>
            <th style={{ fontWeight: "bold" }}>Created At</th>
            <th style={{ fontWeight: "bold" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredInvoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.lorryNo || "-"}</td>
              <td>{inv.customerName || "-"}</td>

              <td>₹ {Number(inv.finalTotal || 0).toFixed(2)}</td>
              <td>{inv.vechileNumber || "-"}</td>

              <td>{inv.paymentStatus === "paid" ? "Paid" : "Not Paid"}</td>
              <td>₹ {inv.amountPaid || 0}</td>
              <td>₹ {inv.amountPending || 0}</td>
              <td>
                {inv.nextPaymentDate
                  ? new Date(inv.nextPaymentDate).toLocaleDateString()
                  : "-"}
              </td>

              <td>
                {" "}
                {inv.createdAt?.toDate
                  ? inv.createdAt.toDate().toLocaleDateString()
                  : "-"}
              </td>

              <td>
                <button onClick={() => navigate(`/edit-invoice/${inv.id}`)}>
                  Edit
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(inv.id)}
                >
                  Delete
                </button>
                <button onClick={() => getInvoice(inv)}>Download</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListInvoices;
