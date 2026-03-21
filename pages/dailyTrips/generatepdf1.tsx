import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function downloadBiltyPDF(trip) {
  const pdf = new jsPDF();

  // --------------------------------------------------
  // HEADER - Transporter Info
  // --------------------------------------------------
  pdf.setFontSize(18);
  pdf.text("PRAKASH TRANSPORTS", 14, 15);

  pdf.setFontSize(11);
  pdf.text("Address: Transport Nagar, Kanpur, Uttar Pradesh", 14, 22);
  pdf.text("Phone: +91 9540670670", 14, 28);
  pdf.text("Email: prakashtransport@gmail.com", 14, 34);

  pdf.setLineWidth(0.5);
  pdf.line(14, 38, 195, 38); // horizontal line

  // --------------------------------------------------
  // TITLE
  // --------------------------------------------------
  pdf.setFontSize(16);
  pdf.text("Daily Trip / Bilty Details", 14, 48);

  // --------------------------------------------------
  // TRIP INFO TABLE
  // --------------------------------------------------
  autoTable(pdf, {
    startY: 55,
    theme: "grid",
    headStyles: { fillColor: [70, 130, 180] },
    bodyStyles: { fontSize: 11 },
    head: [["Field", "Value"]],
    body: [
      ["Lorry No", trip.lorryNo],
      ["Customer Name", trip.customerName || ""],
      ["Driver Name", trip.driverName || ""],
      ["From Location", trip.fromLocation],
      ["To Location", trip.toLocation],
      ["Consignor GST", trip.consignorGST],
      ["Consignee GST", trip.consigneeGST],
      ["Invoice Value", `₹ ${trip.invoiceValue}`],
      ["Create Bilty", trip.createBilty],
      ["Added By", trip.addedBy],
      ["Added Date", trip.addedDate],
    ],
  });

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------
  let finalY = pdf.lastAutoTable.finalY + 20;

  pdf.setFontSize(12);
  pdf.text("Authorized Signatory", 150, finalY + 20);
  pdf.line(140, finalY + 25, 195, finalY + 25);

  pdf.setFontSize(10);
  pdf.text("Thank you for choosing Prakash Transports", 14, finalY + 40);

  // --------------------------------------------------
  // SAVE PDF
  // --------------------------------------------------
  pdf.save(`Trip_${trip.lorryNo}.pdf`);
}
