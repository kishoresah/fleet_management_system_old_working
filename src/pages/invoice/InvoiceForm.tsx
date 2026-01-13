import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect } from "react";
import { db } from "../../firebaseConfigTest";
import { formatDateMMDDYYYY } from "../../utils";

interface Props {
  formData: any;
  customers: any[];
  onChange: (e: any) => void;
  onItemChange: (i: number, field: string, value: any) => void;
  addItem: () => void;
  removeItem: (i: number) => void;
  calculateTotals: () => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  selectedTrips: string[];
  setSelectedTrips: React.Dispatch<React.SetStateAction<string[]>>;
  isSubmitting: boolean;
}

const InvoiceForm: React.FC<Props> = ({
  formData,
  customers,
  onChange,
  onItemChange,
  addItem,
  removeItem,
  calculateTotals,
  selectedTrips,
  setSelectedTrips,
  onSubmit,
  submitText,
  isSubmitting,
}) => {
  const [trips, setTrips] = React.useState<any[]>([]);

  const loadTripsByCustomer = async (customerId: string) => {
    if (!customerId) return;

    console.log("Loading trips for customer:", customerId);

    const q = query(
      collection(db, "dailyTrips"),
      where("customerId", "==", customerId),
      where("paymentStatus", "==", "unpaid"),
      where("invoiceCreated", "==", "no"),
      orderBy("addTripDate", "desc")
    );

    const snap = await getDocs(q);
    setTrips(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  };

  console.log("Selected Trips in InvoiceForm:", trips);
  useEffect(() => {
    const items = trips
      .filter((t) => selectedTrips.includes(t.id))
      .map((t) => ({
        description: `Trip on ${formatDateMMDDYYYY(t.addTripDate)} —{" "}
                          ${t.fromLocation} to ${t.toLocation}{" "}
                          ${
                            t.tripCharges
                              ? "— ₹" + t.tripCharges + " — " + t.tripExpense
                              : ""
                          }`,
        quantity: 1,
        price: t.tripCharges ? t.tripCharges : 0,
        total: t.tripCharges ? t.tripCharges : 0,
        tripId: t.id,
      }));

    onChange({
      target: {
        name: "items",
        value: items,
      },
    });
  }, [selectedTrips]);

  return (
    <div className="trip-container">
      <div className="trip-card">
        <form onSubmit={onSubmit}>
          <div className="grid">
            {/* Customer Selector */}
            <div className="form-row">
              <div className="form-group">
                <label>Select Customer</label>
                <select
                  name="customerName"
                  value={formData.customerId}
                  onChange={(e) => {
                    onChange(e);
                    loadTripsByCustomer(e.target.value);
                    setSelectedTrips([]);
                  }}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {trips.length > 0 && (
              <>
                {" "}
                <div className="form-row">
                  <div className="form-group">
                    <h3>Unpaid Trips</h3>
                    {trips.map((trip) => (
                      <label key={trip.id} className="trip-row">
                        <input
                          type="checkbox"
                          checked={selectedTrips.includes(trip.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedTrips([...selectedTrips, trip.id]);
                            } else {
                              setSelectedTrips(
                                selectedTrips.filter((id) => id !== trip.id)
                              );
                            }
                          }}
                        />

                        <span className="trip-text">
                          {formatDateMMDDYYYY(trip.addTripDate)} —{" "}
                          {trip.fromLocation} to {trip.toLocation}{" "}
                          {trip.tripCharges
                            ? "— ₹" +
                              trip.tripCharges +
                              " — " +
                              trip.tripExpense
                            : ""}
                        </span>
                      </label>
                    ))}{" "}
                  </div>
                </div>
              </>
            )}

            {/* GST Yes/No */}
            <div className="form-row">
              <div className="form-group">
                <label>Apply GST?</label>
                <select
                  name="isGST"
                  value={formData.isGST ? "yes" : "no"}
                  onChange={onChange}
                >
                  <option value="yes">Yes (With GST)</option>
                  <option value="no">No (Without GST)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Total Bill Amount</label>
                <input
                  type="text"
                  name="tripBillAmount"
                  value={formData.tripBillAmount}
                  onChange={onChange}
                />
              </div>
            </div>

            <hr />

            {/* Payment Status */}
            <div className="form-row">
              <div className="form-group">
                <label>Payment Status</label>
                <select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onChange={onChange}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Not Paid</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvoiceForm;
