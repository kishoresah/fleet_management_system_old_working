import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useEffect, useState } from "react";

export default function InvoiceDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [invoice, setInvoice] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const inv = await getDoc(doc(db, "invoices", id!));
      setInvoice(inv.data());

      const q = query(collection(db, "payments"), where("invoiceId", "==", id));
      const snap = await getDocs(q);
      setPayments(snap.docs.map((d) => d.data()));
    })();
  }, []);

  if (!invoice) return <h3>Loading...</h3>;

  return (
    <div>
      <h2>Invoice #{invoice.lorryNo}</h2>
      <p>Customer: {invoice.customerName}</p>
      <p>Total: ₹ {invoice.tripBillAmount}</p>
      <p>Paid: ₹ {invoice.totalPaid}</p>
      <p>Pending: ₹ {invoice.totalPending}</p>

      <button onClick={() => navigate(`/add-payment/${id}`)}>
        + Add Payment
      </button>

      <h3>Payment History</h3>
      <table className="styled-table">
        <thead>
          <tr>
            <th>Amount Paid</th>

            <th>Payment Added by</th>
            <th>Payment Date</th>
            <th>Payment Added Date</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p, i) => (
            <tr key={i}>
              <td>₹ {p.amountPaid}</td>

              <td> {p.addedByUsername}</td>
              <td>{p.paymentDate?.toDate().toLocaleDateString()}</td>
              <td>
                {p.addedAt?.toDate
                  ? p.addedAt.toDate().toLocaleDateString()
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
