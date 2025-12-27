import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";

export default function ListInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    getDocs(collection(db, "invoices")).then((snap) =>
      setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, []);

  const sendWhatsAppReminder = (inv: any) => {
    const message = `Hello ${
      inv.customerName
    }, Pending balance for invoice number ${inv.lorryNo} is ₹${
      inv.totalPending
    }. Last payment date ${
      inv.lastPaymentDate?.toDate
        ? inv.lastPaymentDate.toDate().toLocaleDateString()
        : "-"
    } and invoice date ${
      inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleDateString() : "-"
    }. Please arrange the payment. Thank you.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const sendGmailReminder = (inv: any) => {
    const subject = `Payment Reminder: Invoice #${inv.lorryNo} amount due ₹${inv.totalPending}`;
    const body = `Hello ${inv.customerName},

This is a gentle reminder that the pending balance for your invoice #${
      inv.lorryNo
    } is ₹${inv.totalPending}.
  
Invoice Date: ${
      inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleDateString() : "-"
    }
Last Payment Date: ${
      inv.lastPaymentDate?.toDate
        ? inv.lastPaymentDate.toDate().toLocaleDateString()
        : "-"
    }

Please arrange the payment at your earliest convenience.
Thank you for your prompt attention.

Best regards,
Prakash Transports,
Sudhir Kumar
Phone: +91-9540670670`;

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${
      inv.customerEmail || ""
    }&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailURL, "_blank");
  };

  return (
    <div className="page-container">
      <h2>Invoices</h2>

      <button onClick={() => navigate("/add-invoice")}>+ Add Invoice</button>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Lorry No</th>
            <th>Customer</th>
            <th>Total Amt</th>
            <th>Paid Amt</th>
            <th>Pending Amt</th>
            <th>Status</th>
            <th style={{ fontWeight: "bold" }}>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => {
            const isPaid = inv.totalPaid >= inv.finalTotal;

            return (
              <tr key={inv.id}>
                <td>{inv.lorryNo}</td>
                <td>{inv.customerName}</td>
                <td>₹ {inv.finalTotal}</td>
                <td>₹ {inv.totalPaid}</td>
                <td>₹ {inv.totalPending}</td>

                {/* ✅ Status Badge */}
                <td>
                  {inv.totalPaid === 0 && (
                    <span className="badge red">Unpaid</span>
                  )}
                  {inv.totalPaid > 0 && inv.totalPaid < inv.finalTotal && (
                    <span className="badge orange">Partial</span>
                  )}
                  {isPaid && <span className="badge green">Paid</span>}
                </td>

                <td>
                  {inv.createdAt?.toDate
                    ? inv.createdAt.toDate().toLocaleDateString()
                    : "-"}
                </td>

                <td style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  <button onClick={() => navigate(`/invoice/${inv.id}`)}>
                    View
                  </button>

                  <button onClick={() => navigate(`/add-payment/${inv.id}`)}>
                    Add Payment
                  </button>

                  {/* ✅ Only show reminder buttons if NOT fully paid */}
                  {!isPaid && (
                    <>
                      <button
                        onClick={() => sendWhatsAppReminder(inv)}
                        style={{
                          backgroundColor: "#25D366",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        title="Send WhatsApp Reminder"
                      >
                        <FaWhatsapp size={18} />
                        WhatsApp
                      </button>

                      <button
                        onClick={() => sendGmailReminder(inv)}
                        style={{
                          backgroundColor: "#EA4335",
                          color: "white",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "5px",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                        }}
                        title="Send Gmail Reminder"
                      >
                        <FaEnvelope size={18} />
                        Gmail
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
