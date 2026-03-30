import React, { useEffect, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate, useParams } from "react-router-dom";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa";
import downloadInvoicePDF from "./generateinvoicepdf";
import BackButton from "../../components/Back";
import { Box, Button } from "@mui/material";

export default function ListInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [customerMap, setCustomerMap] = useState<Record<string, string>>({});
  const { id } = useParams();

  useEffect(() => {
    const loadData = async () => {
      if (id) {
        // Single invoice
        const docSnap = await getDoc(doc(db, "invoices", id));
        if (docSnap.exists()) {
          setInvoices([{ id: docSnap.id, ...docSnap.data() }]);
        }
      } else {
        // All invoices
        await loadInvoices();
      }
    };

    loadData();
  }, [id]);

  console.log("Loaded invoices:", invoices);

  const loadInvoices = async () => {
    const q = query(
      collection(db, "invoices"),
      orderBy("createdAt", "desc"), // 🔥 latest first
    );

    const snap = await getDocs(q);
    setInvoices(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    const loadCustomers = async () => {
      const snap = await getDocs(collection(db, "customers"));

      const map: Record<string, string> = {};
      snap.docs.forEach((doc) => {
        map[doc.id] = doc.data().name;
      });

      setCustomerMap(map);
    };

    loadCustomers();
  }, []);

  const getCustomerNameById = (id: string) => {
    return customerMap[id] || "—";
  };

  const sendWhatsAppReminder = (inv: any, name: string) => {
    const bal: number = (inv.tripBillAmount || 0) - (inv.totalPaid || 0);

    const message = `Hello ${name}, Pending balance for invoice is ₹ ${bal}. Invoice date ${inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleDateString() : "-"
      }. Please arrange the payment. Thank you.`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const sendGmailReminder = (inv: any, name: string) => {
    const bal: number = (inv.tripBillAmount || 0) - (inv.totalPaid || 0);
    const subject = `Payment Reminder: Invoice #${inv.lorryNo} amount due ₹${Number(inv.tripBillAmount || 0) - Number(inv.totalPaid || 0)
      }`;
    const body = `Hello ${name},

This is a gentle reminder that the pending balance for your invoice is 
₹${bal}.
  
Invoice Date: ${inv.createdAt?.toDate ? inv.createdAt.toDate().toLocaleDateString() : "-"
      }

Please arrange the payment at your earliest convenience.
Thank you for your prompt attention.

Best regards,
Prakash Transports,
Sudhir Kumar
Phone: +91-9540670670`;

    const gmailURL = `https://mail.google.com/mail/?view=cm&fs=1&to=${inv.customerEmail || ""
      }&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.open(gmailURL, "_blank");
  };
  console.log("Invoices loaded:", invoices);

  return (
    <div className="page-container">
      <Box sx={{
        width: "100%",
        maxWidth: { xs: "72vw", md: "100%" },
        overflow: "hidden",
      }}>

        <Box display={"flex"} justifyContent={"space-between"} alignItems={"baseline"}>
          <BackButton className="primary-blue-btn" />
          <h2>Invoices</h2>
          {/* <Button variant="contained" color="success" onClick={() => navigate("/add-invoice")}>
          + Add Invoice
        </Button> */}
          <button onClick={() => navigate("/add-invoice")} className="primary-blue-btn">+ Add Invoice</button>
        </Box>

        <div style={{ overflowX: "auto", width: "100%" }}>
          <table className="styled-table" style={{ minWidth: "900px" }}>

            <thead>
              <tr>
                <th>Lorry No</th>
                <th>Customer</th>
                <th>Total Pending</th>

                <th>Advance</th>
                <th>Total Paid</th>
                <th>Payment Status</th>
                <th style={{ fontWeight: "bold" }}>Created At</th>
                <th colSpan={2}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((inv) => {
                return (
                  <tr key={inv.id}>
                    <td>{inv.lorryNo}</td>
                    <td>{getCustomerNameById(inv.customerName)}</td>
                    <td>{inv.totalPending}</td>

                    <td>{inv.advanceAmount}</td>

                    <td>{inv.totalPaid}</td>
                    <td>{inv.paymentStatus}</td>

                    <td>
                      {inv.createdAt?.toDate
                        ? inv.createdAt.toDate().toLocaleDateString()
                        : "-"}
                    </td>

                    <td style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      <button onClick={() => navigate(`/invoice/${inv.id}`)}>
                        View
                      </button>

                      {inv.paymentStatus.toLowerCase() != "paid" && (
                        <button onClick={() => navigate(`/add-payment/${inv.id}`)}>
                          Add Payment
                        </button>
                      )}

                      <button onClick={() => downloadInvoicePDF(inv.id, inv)}>
                        Download PDF
                      </button>

                      <>
                        <button
                          onClick={() =>
                            sendWhatsAppReminder(
                              inv,
                              getCustomerNameById(inv.customerName),
                            )
                          }
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
                          onClick={() =>
                            sendGmailReminder(
                              inv,
                              getCustomerNameById(inv.customerName),
                            )
                          }
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
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Box>
    </div>
  );
}
