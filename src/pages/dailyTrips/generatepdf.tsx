import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import transportLogo from "../../assets/www.png"; // your logo path

export async function downloadBiltyPDF(trip) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 820]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  let y = 780; // top cursor

  const drawText = (text, x, y, size = 12, f = font, color = rgb(0, 0, 0)) => {
    page.drawText(text, { x, y, size, font: f, color });
  };

  const drawLine = (x1, y1, x2, y2, color = rgb(0.2, 0.2, 0.2)) => {
    page.drawLine({
      start: { x: x1, y: y1 },
      end: { x: x2, y: y2 },
      thickness: 1,
      color,
    });
  };

  // =====================================================================
  // HEADER
  // =====================================================================

  drawText(
    `GST No: ${trip.consignorGst || "---"}`,
    20,
    y,
    12,
    bold,
    rgb(0.1, 0.1, 0.5)
  );
  drawText("Subject to Delhi Jurisdiction", 220, y, 13, bold, rgb(0.5, 0, 0));
  drawText(
    `Mob: ${trip.companyMobile || "9999999999"}`,
    480,
    y,
    12,
    bold,
    rgb(0.1, 0.5, 0.1)
  );
  y -= 25;

  drawText(
    `PAN: ${trip.companyPan || "-----"}`,
    20,
    y,
    12,
    bold,
    rgb(0.2, 0.2, 0.6)
  );
  drawText(
    `Mob: ${trip.altMobile || "4343434343"}`,
    480,
    y,
    12,
    bold,
    rgb(0.2, 0.4, 0.7)
  );
  y -= 40;

  // =====================================================================
  // LOGO + TRANSPORT INFO
  // =====================================================================

  const imageBytes = await fetch(transportLogo).then((res) =>
    res.arrayBuffer()
  );
  const logoImage = await pdfDoc.embedPng(imageBytes);
  page.drawImage(logoImage, { x: 20, y: y - 10, width: 90, height: 60 });

  drawText(
    trip.transportName || "Transport Company Name",
    180,
    y + 25,
    18,
    bold,
    rgb(0.2, 0.2, 0.6)
  );
  // Transport Company Highlight Line
  drawText(
    "NTER, LPT FOR ALL OVER INDIA",
    180,
    y + 20,
    11,
    bold,
    rgb(0.1, 0.1, 0.5)
  );

  // Multi-Line Address Below
  drawText(
    "Delhi, Uttar Pradesh, Uttaranchal, Haryana, Punjab, Rajasthan, Chandigarh &",
    180,
    y + 5,
    10,
    font
  );

  drawText("S-15/88, Janta Jeewan Camp,", 180, y - 10, 10, font);

  drawText(
    "D1/4, D-Block Okhla Industrial Area Phase 2, New Delhi - 110020",
    180,
    y - 25,
    10,
    font
  );

  y -= 70; // adjust spacing for next section
  // =====================================================================
  // CONSIGNOR COPY & LORRY DETAILS
  // =====================================================================
  // ------- CONSIGNMENT LEGAL TEXT IN BLACK BOX -------
  const legalText = [
    "This consignment covered by this set of Lorry receipt from shall be stored at",
    "all destination under the control of the Transport Operator and shall be",
    "delivered to or to the order of the Consignee bank whose name is not",
    "mentioned in the Lorry Receipt. It will under the circumstances be delivered",
    "to anyone without the written authority from the consignee Bank or on its",
    "order enclosed on the consignee Bank or on the separate Letter of Authority.",
  ];

  // Box dimensions
  const boxX = 15;
  let boxY = y; // starting Y (use your current y)
  const boxWidth = 570; // full width
  const lineHeight = 12;
  const padding = 10;

  // Calculate box height
  const boxHeight = legalText.length * lineHeight + padding * 2;

  // Draw box outline
  page.drawRectangle({
    x: boxX,
    y: boxY - boxHeight,
    width: boxWidth,
    height: boxHeight,
    borderWidth: 1,
    borderColor: rgb(0, 0, 0),
  });

  // Draw text inside box
  let textY = boxY - padding - 8;

  legalText.forEach((line) => {
    drawText(line, boxX + padding, textY, 8, font);
    textY -= lineHeight;
  });

  // update y for next section
  y = boxY - boxHeight - 20;

  drawText("CONSIGNOR COPY", 240, y, 12, bold, rgb(0.7, 0, 0));
  drawText(`Lorry No: ${trip.lorryNo}`, 480, y, 12, bold, rgb(0.1, 0.3, 0.7));
  y -= 30;

  // =====================================================================
  // TABLE HEADER (COLORED)
  // =====================================================================

  const tableHeaders = [
    "Packages",
    "Description",
    "Weight",
    "Rate",
    "Amount Payable",
    "Paid",
    "To be Billed",
  ];

  const xPos = [20, 100, 230, 290, 350, 430, 510];
  const widths = [80, 120, 60, 60, 70, 70, 70];

  // background for header
  page.drawRectangle({
    x: 20,
    y: y - 5,
    width: 560,
    height: 25,
    color: rgb(0.8, 0.9, 1),
    borderWidth: 1,
    borderColor: rgb(0.3, 0.3, 0.6),
  });

  tableHeaders.forEach((h, i) => {
    drawText(h, xPos[i], y, 10, bold, rgb(0, 0, 0.4));
  });

  y -= 30;

  // =====================================================================
  // TABLE ROWS (MULTIPLE ROWS)
  // =====================================================================

  const rows = trip.items || [
    {
      packages: trip.packages,
      desc: trip.description,
      weight: trip.weight,
      rate: trip.rate,
      amtToPay: trip.amountToPay,
      paid: trip.paid,
      toBeBilled: trip.toBeBilled,
    },
  ];

  rows.forEach((r) => {
    // row background
    page.drawRectangle({
      x: 20,
      y: y - 5,
      width: 560,
      height: 22,
      color: rgb(0.95, 0.95, 0.95),
      borderWidth: 0.5,
      borderColor: rgb(0.7, 0.7, 0.7),
    });

    const data = [
      r.packages || "-",
      r.desc || "-",
      r.weight || "-",
      r.rate || "-",
      r.amtToPay || "-",
      r.paid || "-",
      r.toBeBilled || "-",
    ];

    data.forEach((text, i) => {
      drawText(String(text), xPos[i], y, 10);
    });

    y -= 25;
  });

  y -= 30;

  // =====================================================================
  // FOOTER
  // =====================================================================

  drawLine(20, y + 20, 560, y + 20);
  drawText("Owner Signature", 450, y, 12, bold, rgb(0.4, 0, 0));

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = `Bilty_${trip.lorryNo}.pdf`;
  a.click();
}
