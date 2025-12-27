import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import downloadBiltyPDF from "./generatepdf1";

export default function TripList() {
  const navigate = useNavigate();

  const [trips, setTrips] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [drivers, setDrivers] = useState([]);

  // Filters
  const [filterCustomer, setFilterCustomer] = useState("");
  const [filterDriver, setFilterDriver] = useState("");
  const [filterLorryNo, setFilterLorryNo] = useState("");
  const [filterDate, setFilterDate] = useState("");

  useEffect(() => {
    loadTrips();
    loadCustomers();
    loadDrivers();
  }, []);

  const loadTrips = async () => {
    const q = query(collection(db, "dailyTrips"), orderBy("lorryNo", "desc"));
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
    await deleteDoc(doc(db, "dailyTrips", id));
    setTrips(trips.filter((t) => t.id !== id));
  };

  // Filtering logic
  const filteredTrips = trips.filter((t) => {
    return (
      (filterCustomer ? t.customerId === filterCustomer : true) &&
      (filterDriver ? t.driverId === filterDriver : true) &&
      (filterLorryNo ? t.lorryNo.toString().includes(filterLorryNo) : true) &&
      (filterDate ? t.addedDate?.substring(0, 10) === filterDate : true)
    );
  });

  return (
    <div className="page-container">
      <h2>Daily Trip List</h2>

      <button onClick={() => navigate("/add-daily-trip")}>
        + Add Daily Trip
      </button>

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

        <input
          type="date"
          value={filterDate}
          onChange={(e) => setFilterDate(e.target.value)}
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
            <th>Bilty</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filteredTrips.map((t) => {
            const customer = customers.find((c) => c.id === t.customerId);
            const driver = drivers.find((d) => d.id === t.driverId);

            return (
              <tr key={t.id}>
                <td>{t.lorryNo}</td>
                <td>{customer?.name}</td>
                <td>{driver?.name}</td>
                <td>{t.fromLocation}</td>
                <td>{t.toLocation}</td>
                <td>₹ {t.invoiceValue}</td>

                {/* BILTY BUTTON */}

                <td>{t.addedDate}</td>

                <td>
                  <button onClick={() => downloadBiltyPDF(t)}>
                    Download Bilty
                  </button>
                  <button onClick={() => navigate(`/edit-daily-trip/${t.id}`)}>
                    Edit
                  </button>
                  <button
                    style={{
                      marginLeft: "5px",
                      background: "red",
                      color: "#fff",
                    }}
                    onClick={() => deleteTrip(t.id)}
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
        </tbody>
      </table>
    </div>
  );
}
