import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";
import downloadBiltyPDF from "./generatepdf1";
import { formatDateMMDDYYYY } from "../../utils";
import DeleteConfirmModal from "../../components/DeleteConfirmModal";

export default function TripList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const today = new Date().toISOString().substring(0, 10);

  // Filters
  const [filterCustomer, setFilterCustomer] = useState("");
  const [localCustomerName, setLocalCustomerName] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTripId, setDeleteTripId] = useState(null);

  const [filterDriver, setFilterDriver] = useState("");
  const [filterLorryNo, setFilterLorryNo] = useState("");
  const [filterDate, setFilterDate] = useState("");

  // Pagination
  const PAGE_SIZE = 5;
  const [currentPage, setCurrentPage] = useState(1);

  // Date range filters
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  useEffect(() => {
    loadTrips();
    loadCustomers();
    loadDrivers();
  }, []);

  /* const loadTrips = async () => {
    const q = query(collection(db, "dailyTrips"), orderBy("lorryNo", "desc"));
    const snap = await getDocs(q);
    setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };*/
  const loadTrips = async () => {
    const q = query(
      collection(db, "dailyTrips"),
      orderBy("addTripDate", "desc") // 🔥 latest first
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

  const deleteTrip = async (id) => {
    const role = localStorage.getItem("role");
    if (role !== "1") {
      alert("Only Admin can delete Trips");
      return;
    }
    await deleteDoc(doc(db, "dailyTrips", id));
    setTrips(trips.filter((t) => t.id !== id));
  };

  const handleDeleteClick = (id) => {
    const role = localStorage.getItem("role");
    setDeleteTripId(id);
    setShowDeleteModal(true);
  };

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

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteTripId(null);
  };

  // Filtering logic
  const filteredTrips = trips.filter((t) => {
    const tripDate = t.addTripDate?.substring(0, 10); // yyyy-mm-dd

    console.log("Trip Date:", tripDate, "Filter Date:", filterDate);
    const isWithinDateRange =
      (!fromDate || tripDate >= fromDate) && (!toDate || tripDate <= toDate);

    return (
      (filterCustomer ? t.customerId === filterCustomer : true) &&
      (filterDriver ? t.driverId === filterDriver : true) &&
      (filterLorryNo ? t.lorryNo?.toString().includes(filterLorryNo) : true) &&
      (localCustomerName
        ? t.localCustomerName?.toString().includes(localCustomerName)
        : true) &&
      isWithinDateRange
    );
  });

  console.log("Filtered Trips:", filteredTrips);

  const totalPages = Math.ceil(filteredTrips.length / PAGE_SIZE);

  const paginatedTrips = filteredTrips.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterCustomer, filterDriver, filterLorryNo, fromDate, toDate]);

  const clearFilters = () => {
    setFilterCustomer("");
    setLocalCustomerName("");
    setFilterDriver("");
    setFilterLorryNo("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  return (
    <div className="page-container">
      <h2>Daily Trip List</h2>

      <button onClick={() => navigate("/add-daily-trip")}>
        + Add Daily Trip
      </button>

      <button onClick={() => clearFilters()}>Clear Filters</button>

      {/* FILTERS */}
      <div
        className="filters"
        style={{ display: "flex", gap: "10px", marginTop: "20px" }}
      >
        <select
          value={filterCustomer}
          onChange={(e) => setFilterCustomer(e.target.value)}
        >
          <option value="">Filter by Customer</option>
          {customers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Local Customer"
          value={localCustomerName}
          onChange={(e) => setLocalCustomerName(e.target.value)}
        />

        <select
          value={filterDriver}
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
          placeholder="Lorry No"
          value={filterLorryNo}
          onChange={(e) => setFilterLorryNo(e.target.value)}
        />
      </div>
      <div
        className="filters"
        style={{ display: "flex", gap: "10px", marginTop: "20px" }}
      >
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          placeholder="From date"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          placeholder="To date"
        />
      </div>

      {/* TABLE */}
      <table className="styled-table" style={{ marginTop: "20px" }}>
        <thead>
          <tr>
            <th>Lorry No</th>
            <th>Customer</th>
            <th>Driver</th>
            <th>From</th>
            <th>To</th>
            <th>Invoice Value</th>
            <th>Trip Date</th>
            <th>Added Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {paginatedTrips.map((t) => {
            const customer = customers.find((c) => c.id === t.customerId);
            const driver = drivers.find((d) => d.id === t.driverId);

            return (
              <tr key={t.id}>
                <td>{t.lorryNo ? t.lorryNo : "N/A"}</td>
                <td>
                  {t?.localCustomerName ? t?.localCustomerName : customer?.name}{" "}
                </td>
                <td>{driver?.name}</td>
                <td>{t.fromLocation}</td>
                <td>{t.toLocation}</td>
                <td>₹ {t.tripCharges}</td>

                {/* BILTY BUTTON */}
                <td>{formatDateMMDDYYYY(t.addTripDate)}</td>
                <td>{formatDateMMDDYYYY(t.addedDate)}</td>

                <td>
                  <button onClick={() => navigate(`/edit-daily-trip/${t.id}`)}>
                    Edit
                  </button>
                  <button
                    style={{
                      marginLeft: "5px",
                      background: "red",
                      color: "#fff",
                    }}
                    onClick={() => handleDeleteClick(t.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}

          {filteredTrips.length === 0 && (
            <tr>
              <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
                No trips found
              </td>
            </tr>
          )}

          <tr>
            <td colSpan={10} style={{ textAlign: "center", padding: "20px" }}>
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

      <DeleteConfirmModal
        open={showDeleteModal}
        title="Delete Trip"
        message="Are you sure you want to delete this trip? This action cannot be undone."
        onConfirm={confirmDeleteTrip}
        onCancel={cancelDelete}
      />
    </div>
  );
}
