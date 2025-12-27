import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { FaWhatsapp, FaEnvelope } from "react-icons/fa"; // ✅ Added icons

export default function OutstandingReport() {
  const [invoices, setInvoices] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const snap = await getDocs(collection(db, "invoices"));
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      const filtered = list.filter((inv) => (inv.totalPending || 0) > 0);
      filtered.sort((a, b) => b.totalPending - a.totalPending);
      setInvoices(filtered);
    })();
  }, []);

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

  return (
    <div className="page-container">
      <h2>Outstanding Payments Report</h2>

      <table className="styled-table">
        <thead>
          <tr>
            <th>Invoice No</th>
            <th>Customer</th>
            <th>Total Amt</th>
            <th>Paid Amt</th>
            <th>Pending Amt</th>
            <th>Created At</th>
            <th>Last Payment Date</th>
            <th>Send Reminder</th>
          </tr>
        </thead>

        <tbody>
          {invoices.map((inv) => (
            <tr key={inv.id}>
              <td>{inv.lorryNo}</td>
              <td>{inv.customerName}</td>
              <td>₹ {inv.finalTotal}</td>
              <td>₹ {inv.totalPaid}</td>
              <td>₹ {inv.totalPending}</td>
              <td>
                {inv.createdAt?.toDate
                  ? inv.createdAt.toDate().toLocaleDateString()
                  : "-"}
              </td>
              <td>
                {inv.lastPaymentDate?.toDate
                  ? inv.lastPaymentDate.toDate().toLocaleDateString()
                  : "-"}
              </td>
              <td style={{ display: "flex", gap: "8px" }}>
                {/* ✅ WhatsApp Button */}
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

                {/* ✅ Gmail Button */}
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
