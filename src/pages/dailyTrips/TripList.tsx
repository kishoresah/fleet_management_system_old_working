import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";
import downloadBiltyPDF from "./generatepdfreports";
import { formatDateMMDDYYYY, formatDateYYYYMMDD } from "../../utils";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";
import BackButton from "../../components/Back";
import Box from "@mui/material/Box";

export default function TripList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Filters
  const [filterCustomer, setFilterCustomer] = useState(() => {
    return localStorage.getItem("filterCustomer") || "";
  });
  const [localCustomerName, setLocalCustomerName] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTripId, setDeleteTripId] = useState(null);

  const [filterDriver, setFilterDriver] = useState("");
  const [filterVehicles, setFilterVehicles] = useState("");
  const [filterLorryNo, setFilterLorryNo] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [vehicles, setVehicles] = useState([]);
  // Pagination
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  // Date range filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadTrips();
    loadCustomers();
    loadDrivers();
    loadVehicles();
  }, []);

  const handleDuplicate = async (
    trip: any,
    docRefId: string,
    duplicate: boolean = true,
  ) => {
    try {
      if (duplicate) {
        if (!window.confirm("Duplicate this trip?")) return;
        const newTrip = {
          ...trip,
          addTripDate: formatDateYYYYMMDD(new Date()),
          tripExpense: 0,
          tripCharges: 0,
          labourCharges: 0,
          advanceAmount: 0,
          detentionCharges: 0,
          tripCommission: 0,
          specialNotes: "",
          paymentStatus: "unpaid",
          invoiceCreated: "no",
          addedDate: new Date().toLocaleString(),
          // metadata
          createdAt: serverTimestamp(),
        };

        const docRef = await addDoc(collection(db, "dailyTrips"), newTrip);

        // ✅ Redirect to new trip
        navigate(`/edit-daily-trip/${docRef.id}?mode=duplicate`);
      } else {
        navigate(`/edit-daily-trip/${docRefId}?mode=minimal`);
      }
    } catch (error) {
      console.error("Duplicate failed", error);
      alert("Failed to duplicate trip");
    }
  };

  const loadTrips = async () => {
    const q = query(
      collection(db, "dailyTrips"),
      orderBy("addTripDate", "desc"), // 🔥 latest first
    );

    const snap = await getDocs(q);
    setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadCustomers = async () => {
    const snap = await getDocs(collection(db, "customers"));
    setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadDrivers = async () => {
    const snap = await getDocs(collection(db, "drivers"));
    setDrivers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const loadVehicles = async () => {
    const snap = await getDocs(collection(db, "vehicles"));
    setVehicles(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  const handleDeleteClick = (id) => {
    const role = localStorage.getItem("role");
    setDeleteTripId(id);
    setShowDeleteModal(true);
  };
  const handlePushInvoicClick = (id) => { };

  const confirmDeleteTrip = async () => {
    try {
      await deleteDoc(doc(db, "dailyTrips", deleteTripId));
      setTrips((prev) => prev.filter((t) => t.id !== deleteTripId));
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete trip");
    } finally {
      setShowDeleteModal(false);
      setDeleteTripId(null);
    }
  };

  useEffect(() => {
    localStorage.setItem("filterCustomer", filterCustomer);
  }, [filterCustomer]);

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTripId(null);
  };
  console.log("trips ", trips);
  const filteredTrips = trips.filter((t) => {
    const tripDate = t.addTripDate?.substring(0, 10);

    const isWithinDateRange =
      (!fromDate || tripDate >= fromDate) && (!toDate || tripDate <= toDate);

    let customerMatch = true;

    if (filterCustomer === "OTHER") {
      customerMatch = !t.customerId && t.localCustomerName;
    } else if (filterCustomer === "OTHER_PAID") {
      customerMatch =
        !t.customerId && t.localCustomerName && t.paymentStatus === "Paid";
    } else if (filterCustomer === "OTHER_UNPAID") {
      customerMatch =
        !t.customerId && t.localCustomerName && t.paymentStatus === "unpaid";
    } else if (filterCustomer) {
      customerMatch = t.customerId === filterCustomer;
    }

    return (
      customerMatch &&
      (filterDriver ? t.driverId === filterDriver : true) &&
      (filterVehicles ? t.vehicleNumber === filterVehicles : true) &&
      (filterLorryNo ? t.lorryNo?.includes(filterLorryNo) : true) &&
      (localCustomerName
        ? t.localCustomerName
          ?.toLowerCase()
          .includes(localCustomerName.toLowerCase())
        : true) &&
      isWithinDateRange
    );
  });

  const totalPages = Math.ceil(filteredTrips.length / PAGE_SIZE);

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCustomer, filterDriver, filterLorryNo, fromDate, toDate]);

  const clearFilters = () => {
    setFilterCustomer("");
    setFilterVehicles("");
    setLocalCustomerName("");
    setFilterDriver("");
    setFilterLorryNo("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };
  console.log(vehicles);
  return (
    <div className="page-container">
      <Box
        sx={{
          width: "100%",
          maxWidth: { xs: "72vw", md: "100%" },
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <BackButton className="primary-blue-btn" />
          <h2 style={{ margin: 0 }}>Daily Trip List</h2>
          <Box
            sx={{
              order: { xs: 3, md: 0 },
              width: { xs: "100%", md: "auto" },
              marginBottom: { xs: 1, md: 0 },
            }}
          >
            <button onClick={() => navigate("/add-daily-trip")} className="primary-blue-btn">
              + Add Daily Trip
            </button>
          </Box>
        </Box>
        <button onClick={() => clearFilters()} className="primary-grey-btn m-2px">Clear Filters</button>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <button onClick={() => downloadBiltyPDF(filteredTrips, customers)} className="primary-green-btn m-2px">
          Download Trips PDF
        </button>
        {/* FILTERS */}
        <Box
          className="filters"
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: "12px",
            mt: 2,
          }}
        >
          <select
            value={filterCustomer}
            className="form-styled-input-primary"
            onChange={(e) => setFilterCustomer(e.target.value)}
          >
            <option value="">Filter by Customer</option>

            {/* Static options */}
            <option value="OTHER_PAID">Other Paid</option>
            <option value="OTHER_UNPAID">Other Unpaid</option>
            <option value="OTHER">Other</option>

            {/* Dynamic customers */}
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="form-styled-input-primary"
            placeholder="Local Customer"
            value={localCustomerName}
            onChange={(e) => setLocalCustomerName(e.target.value)}
          />

          <select
            className="form-styled-input-primary"
            value={filterVehicles}
            onChange={(e) => setFilterVehicles(e.target.value)}
          >
            <option value="">Filter by Vehicles</option>
            {vehicles.map((d) => (
              <option key={d.vehicleNumber} value={d.vehicleNumber}>
                {d.vehicleNumber}
              </option>
            ))}
          </select>

          <select
            value={filterDriver}
            className="form-styled-input-primary"
            onChange={(e) => setFilterDriver(e.target.value)}
          >
            <option value="">Filter by Driver</option>
            {drivers.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            className="form-styled-input-primary"
            placeholder="Lorry No"
            value={filterLorryNo}
            onChange={(e) => setFilterLorryNo(e.target.value)}
          />
        </Box>
        <div
          className="filters"
          style={{ display: "flex", gap: "10px", marginTop: "20px" }}
        >
          <input
            type="date"
            className="form-styled-input-primary"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            placeholder="From date"
          />

          <input
            type="date"
            className="form-styled-input-primary"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            placeholder="To date"
          />
        </div>
        {/* TABLE */}
        <div style={{ overflowX: "auto", width: "100%" }}>
          <table
            className="styled-table"
            style={{ marginTop: "20px", minWidth: "900px" }}
          >
            <thead>
              <tr>
                <th>Trip Date</th>
                <th>Vehicle No.</th>
                <th>Customer</th>
                <th>From/To</th>
                <th>Freight Amount</th>

                <th>Advance Amount</th>

                <th>Expenses</th>

                <th>Detention Amount</th>

                <th>Labour Amount</th>
                <th>
                  Paymnent /<br></br>Invoice Status
                </th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginatedTrips.map((t) => {
                const customer = customers.find((c) => c.id === t.customerId);

                return (
                  <React.Fragment key={t.id}>
                    <tr>
                      <td>{formatDateMMDDYYYY(t.addTripDate)}</td>

                      <td>{t.vehicleNumber}</td>
                      <td>
                        {t?.localCustomerName
                          ? t?.localCustomerName
                          : customer?.name}{" "}
                      </td>
                      <td>
                        {t.fromLocation}/{t.toLocation}
                      </td>

                      <td>₹ {t.tripCharges}</td>
                      <td>₹ {t.advanceAmount > 0 ? t.advanceAmount : "0"}</td>
                      <td>₹ {t.tripExpense > 0 ? t.tripExpense : "0"}</td>
                      <td>
                        ₹ {t.detentionCharges > 0 ? t.detentionCharges : "0"}
                      </td>
                      <td>₹ {t.labourCharges > 0 ? t.labourCharges : "0"}</td>
                      {/* BILTY BUTTON */}

                      <td>
                        {t.paymentStatus} / {t.invoiceCreated}
                      </td>

                      <td style={{ textAlign: "center" }}>
                        {t.paymentStatus != "Paid" && (
                          <button
                            style={{ marginBottom: "5px" }}
                            onClick={() => navigate(`/edit-daily-trip/${t.id}`)}
                          >
                            Edit
                          </button>
                        )}
                        {t.invoiceId && (
                          <button
                            style={{
                              marginLeft: "5px",
                              background: "#0c531f",
                              color: "#fff",
                            }}
                            onClick={() => navigate(`/invoices/${t.invoiceId}`)}
                          >
                            Invoice{" "}
                          </button>
                        )}

                        <button
                          style={{
                            marginBottom: "5px",
                            background: "#1976d2",
                            color: "#fff",
                          }}
                          onClick={() => handleDuplicate(t, t.id, true)}
                        >
                          Duplicate
                        </button>
                        <button
                          style={{
                            marginBottom: "5px",
                            background: "#1976d2",
                            color: "#fff",
                          }}
                          onClick={() => handleDuplicate(t, t.id, false)}
                        >
                          Minimal Update
                        </button>
                      </td>
                    </tr>

                    {t.specialNotes != "" && (
                      <tr>
                        {" "}
                        <td colSpan={13}>Special Notes:- {t.specialNotes}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredTrips.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    style={{ textAlign: "center", padding: "20px" }}
                  >
                    No trips found
                  </td>
                </tr>
              )}

              <tr>
                <td
                  colSpan={10}
                  style={{ textAlign: "center", padding: "20px" }}
                >
                  <div style={{ marginTop: "20px", textAlign: "center" }}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      Prev
                    </button>

                    <span style={{ margin: "0 10px" }}>
                      Page {currentPage} of {totalPages}
                    </span>

                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      Next
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <DeleteConfirmModal
          open={showDeleteModal}
          title="Delete Trip"
          message="Are you sure you want to delete this trip? This action cannot be undone."
          onConfirm={confirmDeleteTrip}
          onCancel={cancelDelete}
        />
      </Box>
    </div>
  );
}
