import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDateMMDDYYYY } from "../../utils";

function getTripsByDateAsc(trips) {
  return trips
    .filter((trip) => trip.addTripDate) // keep only trips having date
    .sort((a, b) => new Date(a.addTripDate) - new Date(b.addTripDate));
}

export default function downloadTripsPDF(tripsArr = [], customers = []) {
  const trips = getTripsByDateAsc(tripsArr);
  console.log("Generating PDF for trips: ", trips);

  const pdf = new jsPDF("landscape"); // landscape for more columns

  // --------------------------------------------------
  // HEADER
  // --------------------------------------------------
  pdf.setFontSize(18);
  pdf.text("PRAKASH TRANSPORTS", 14, 15);

  pdf.setFontSize(11);
  pdf.text("Okhla Phase 1, New Delhi:- 110020", 14, 22);
  pdf.text("Phone: +91 9540670670 | Email: prakashtransport@gmail.com", 14, 28);

  pdf.line(14, 32, 285, 32);

  // --------------------------------------------------
  // TITLE
  // --------------------------------------------------
  pdf.setFontSize(14);
  pdf.text("Daily Trip / Bilty Report", 14, 42);

  // --------------------------------------------------
  // TABLE DATA (LOOP HERE)
  // --------------------------------------------------
  let totalCharges = 0;
  let totalPending = 0;
  let totalAdvance = 0;
  let totaldetentionCharges = 0;
  let totallabourCharges = 0;

  let totalexpense = 0;

  const tableBody = trips.map((trip, index) => {
    const tripCharges = Number(trip?.tripCharges || 0);
    const tripExpense = Number(trip?.tripExpense || 0);
    const labourCharges = Number(trip?.labourCharges || 0);
    const advanceAmount = Number(trip?.advanceAmount || 0);
    const detentionCharges = Number(trip?.detentionCharges || 0);
    const customer = customers.find((c) => c?.id === trip?.customerId);

    const pendingAmount =
      tripCharges +
      tripExpense +
      labourCharges +
      detentionCharges -
      advanceAmount;

    // cumulative totals
    totalCharges += Number(tripCharges);
    totalPending += Number(pendingAmount);
    totalAdvance += Number(advanceAmount);
    totaldetentionCharges += Number(detentionCharges);
    totallabourCharges += Number(labourCharges);
    totalexpense += Number(tripExpense);

    return [
      index + 1,
      formatDateMMDDYYYY(trip.addTripDate) || "",
      trip.vehicleNumber || "",
      trip.customerId
        ? customer?.name || ""
        : trip.localCustomerName || "OTHER",
      trip.fromLocation || "",
      trip.toLocation || "",
      tripCharges,
      advanceAmount,
      tripExpense,
      labourCharges,
      detentionCharges,
      pendingAmount,
      trip.specialNotes || "",
    ];
  });

  tableBody.push([
    "",
    "",
    "",
    "",
    "",
    "TOTAL",
    totalCharges,
    totalAdvance,
    totalexpense,
    totallabourCharges,
    totaldetentionCharges,
    totalPending,
    "",
    "",
  ]);
  // --------------------------------------------------
  // TABLE
  // --------------------------------------------------
  autoTable(pdf, {
    startY: 48,
    theme: "grid",
    headStyles: {
      fillColor: [70, 130, 180],
      textColor: 255,
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
    },
    head: [
      [
        "S.No",
        "Trip Date",
        "Vehicle No",
        "Customer",
        "From",
        "To",
        "Freight Charges",
        "Advance Amount",
        "Trip Expenses",
        "Detention Charges",
        "Labour Charges",
        "Pending Amount",
        "Notes",
      ],
    ],
    body: tableBody,
  });

  // --------------------------------------------------
  // FOOTER
  // --------------------------------------------------
  const finalY = pdf.lastAutoTable.finalY + 10;

  pdf.setFontSize(10);
  pdf.text("This is a system generated document.", 14, finalY + 10);

  pdf.text("Authorized Signatory", 230, finalY + 10);
  pdf.line(220, finalY + 14, 280, finalY + 14);

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------
  pdf.save(`Daily_Trips_Report.pdf`);
}
