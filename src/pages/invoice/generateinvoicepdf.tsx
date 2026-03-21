import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  collection,
  getDocs,
  query,
  where,
  documentId,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { toWords } from "number-to-words";

import logo from "../../assets/t.png";
import sig from "../../assets/sig.png";
import { formatCurrency, formatDateMMDDYYYY, toTitleCase } from "../../utils";

// ✅ Get full customer info
export const getCustomerById = async (customerId: string) => {
  if (!customerId) return null;

  try {
    const docRef = doc(db, "customers", customerId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching customer:", error);
    return null;
  }
};

const downloadInvoicePDF = async (invoiceId, invoice) => {
  const docPDF = new jsPDF();

  // ✅ Fetch customer ONCE
  const customerInfo = await getCustomerById(invoice.customerName);

  // ✅ Fetch trips
  const tripIds = invoice.items.map((i) => i.tripId);

  const q = query(
    collection(db, "dailyTrips"),
    where(documentId(), "in", tripIds),
  );

  const snapshot = await getDocs(q);

  const tripsMap: any = {};
  snapshot.forEach((d) => {
    tripsMap[d.id] = d.data();
  });

  let grandTotal = 0;
  let subTotal = 0;

  // ✅ Table data
  const tableBody = invoice.items.map((item) => {
    const trip = tripsMap[item.tripId];

    const tripCharges = Number(trip?.tripCharges || 0);
    const tripExpense = Number(trip?.tripExpense || 0);
    const labourCharges = Number(trip?.labourCharges || 0);
    const advanceAmount = Number(trip?.advanceAmount || 0);
    const detentionCharges = Number(trip?.detentionCharges || 0);

    const amount =
      tripCharges +
      labourCharges +
      detentionCharges +
      tripExpense -
      advanceAmount;

    subTotal += amount;

    const particulars = [
      `${trip?.fromLocation || ""} - ${trip?.toLocation || ""}`,
      tripCharges && `Freight: Rs. ${formatCurrency(tripCharges)}`,
      labourCharges && `Labour: Rs. ${formatCurrency(labourCharges)}`,
      detentionCharges && `Detention: Rs. ${formatCurrency(detentionCharges)}`,
      tripExpense && `Expense: Rs. ${formatCurrency(tripExpense)}`,
      advanceAmount && `Advance: Rs. ${formatCurrency(advanceAmount)}`,
      trip?.specialNotes && `Notes: ${trip.specialNotes}`,
    ]
      .filter(Boolean)
      .join("\n");

    const labourDetention =
      Number(labourCharges || 0) + Number(detentionCharges || 0);

    return [
      formatDateMMDDYYYY(trip?.addTripDate),
      particulars,
      labourDetention > 0 ? `Rs. ${formatCurrency(labourDetention)}` : "",
      `Rs. ${formatCurrency(amount)}`,
    ];
  });

  const gstNumber = customerInfo?.gstNumber || "";

  const showGST = gstNumber && !gstNumber.startsWith("07");
  let CGST = 0;
  let SGST = 0;
  grandTotal = subTotal;
  if (showGST) {
    CGST = subTotal * 0.09;
    SGST = subTotal * 0.09;
    grandTotal = grandTotal + CGST + SGST;
  }

  // WATERMARK
  docPDF.setTextColor(200, 200, 200);
  docPDF.setFontSize(40);
  docPDF.text("Prakash Transport Services", 105, 150, {
    angle: 45,
    align: "center",
  });

  docPDF.setTextColor(0, 0, 0);

  // HEADER
  docPDF.addImage(logo, "PNG", 10, 8, 25, 25);

  docPDF.setFontSize(11);
  docPDF.text("Jai Shitla Mata", 105, 10, { align: "center" });

  docPDF.setFontSize(10);

  // Get page width
  const pageWidth = docPDF.internal.pageSize.getWidth();

  // Right aligned text
  docPDF.text("Mob: 9540670670", pageWidth - 10, 10, { align: "right" });
  docPDF.text("7982064808", pageWidth - 10, 15, { align: "right" });

  docPDF.setTextColor(220, 0, 0);
  docPDF.setFontSize(18);
  docPDF.text("PRAKASH TRANSPORT SERVICES", 105, 20, {
    align: "center",
  });

  docPDF.setTextColor(0, 0, 0);
  docPDF.setFontSize(11);
  docPDF.text("TRANSPORT CONTRACTOR", 105, 26, {
    align: "center",
  });

  docPDF.setFontSize(9);
  docPDF.text("Okhla Industrial Area Phase 2, New Delhi", 105, 32, {
    align: "center",
  });
  docPDF.text("State Code: 07", 105, 36, {
    align: "center",
  });

  docPDF.setTextColor(220, 0, 0);
  docPDF.setFontSize(10);
  docPDF.text("GST NO: 07BFUPK9892N1Z3", 105, 40, {
    align: "center",
  });
  docPDF.text("PAN: BFUPK9892N", 105, 45, {
    align: "center",
  });

  docPDF.setTextColor(0, 0, 0);

  // BILL SECTION
  docPDF.rect(10, 55, 190, 25);

  docPDF.setFontSize(10);
  docPDF.text("Billed To:", 12, 62);

  docPDF.text(customerInfo?.name || "", 35, 62);
  if (customerInfo?.gstNumber) {
    docPDF.setFontSize(9);
    docPDF.text(customerInfo?.address || "", 12, 68);
    docPDF.text(`GST: ${customerInfo?.gstNumber || "-"}`, 12, 74);
  }

  docPDF.setFontSize(10);
  docPDF.text(`Invoice No: ${invoice.lorryNo}`, 140, 62);
  docPDF.text(
    `Date: ${formatDateMMDDYYYY(invoice.invoiceCreatedDate)}`,
    140,
    68,
  );

  // TABLE
  autoTable(docPDF, {
    startY: 85,
    theme: "grid",
    tableWidth: 190,
    margin: { left: 10, right: 10 },
    head: [["Date", "Particulars", "Labour & Detention", "Amount"]],
    body: tableBody,
    styles: { fontSize: 9, cellPadding: 3, overflow: "linebreak" },
    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 105 },
      2: { cellWidth: 30 },
      3: { cellWidth: 30 },
    },
  });

  const finalY = docPDF.lastAutoTable.finalY + 10;

  // ✅ LEFT SIDE (TERMS + BANK)
  let leftStartY = finalY;

  docPDF.setFontSize(9);
  docPDF.text("Terms & Conditions:", 10, leftStartY);
  docPDF.text("1. Payment due within 15 days.", 10, leftStartY + 5);
  docPDF.text("2. Interest @24% after due date.", 10, leftStartY + 10);
  docPDF.text("3. Subject to Delhi jurisdiction.", 10, leftStartY + 15);

  const bankStartY = leftStartY + 25;

  docPDF.text("Bank Details:", 10, bankStartY);
  docPDF.text("Bank: State Bank of India", 10, bankStartY + 5);
  docPDF.text("A/C No: 37147031198", 10, bankStartY + 10);
  docPDF.text("IFSC: SBIN0014461", 10, bankStartY + 15);

  // ✅ RIGHT SIDE (TOTAL BOX)
  const boxStartY = finalY - 5;
  const boxHeight = 40;

  docPDF.rect(80, boxStartY, 120, boxHeight);

  docPDF.setFontSize(10);

  docPDF.text(
    `Sub Total: Rs. ${formatCurrency(subTotal)}`,
    198,
    boxStartY + 8,
    { align: "right" },
  );

  if (showGST) {
    docPDF.text(`CGST (9%): Rs. ${formatCurrency(CGST)}`, 198, boxStartY + 16, {
      align: "right",
    });

    docPDF.text(`SGST (9%): Rs. ${formatCurrency(SGST)}`, 198, boxStartY + 24, {
      align: "right",
    });
  }

  docPDF.setFontSize(11);
  docPDF.text(
    `Grand Total: Rs. ${formatCurrency(grandTotal)}`,
    198,
    boxStartY + 30,
    { align: "right" },
  );

  const text = `Amount in words Rs. ${toTitleCase(toWords(grandTotal))} only.`;

  // Proper width fitting inside right box (120 width → use ~100 safe)
  const boxInnerWidth = 100;

  // split text properly based on width
  const lines = docPDF.splitTextToSize(text, boxInnerWidth);

  // allow max 2 clean lines
  const finalLines = lines.slice(0, 2);

  // right edge of the box = 80 + 120 = 200
  const rightEdgeX = 200;

  // small padding from right border
  const paddingRight = 5;

  docPDF.text(finalLines, rightEdgeX - paddingRight, boxStartY + 35, {
    align: "right",
    maxWidth: boxInnerWidth,
  });

  // SIGNATURE
  const signY = Math.max(bankStartY + 25, boxStartY + boxHeight + 10);

  docPDF.setTextColor(220, 0, 0);
  docPDF.text("For PRAKASH TRANSPORT SERVICES", 130, signY);

  docPDF.setTextColor(0, 0, 0);
  docPDF.text("Authorised Signatory", 150, signY + 7);

  docPDF.addImage(sig, "PNG", 150, signY + 10, 35, 12);

  // DISCLAIMER (Bottom Center)
  const pageHeight = docPDF.internal.pageSize.getHeight();

  docPDF.setFontSize(9);
  docPDF.setTextColor(120, 120, 120);

  docPDF.text(
    "This is a computer generated invoice. No signature is required.",
    105,
    pageHeight - 10,
    { align: "center" },
  );

  // reset color
  docPDF.setTextColor(0, 0, 0);

  // SAVE
  docPDF.save(
    `invoice_${invoice.lorryNo}_${customerInfo?.name || "customer"}_${formatDateMMDDYYYY(
      invoice.invoiceCreatedDate,
    )}.pdf`,
  );
};

export default downloadInvoicePDF;
