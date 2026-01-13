import React, { useState } from "react";
import { locations } from "../../location";

export default function TripForm({
  formData,
  customers,
  drivers,
  onChange,
  onCustomerChange,
  onVehicleChange,
  onSubmit,
  submitText,
  isSubmitting,
}) {
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const filterLocations = (value) => {
    if (!value) return [];
    return locationOptions.filter((loc) => loc.includes(value.toUpperCase()));
  };

  const locationOptions = [
    ...new Set(locations.flat().map((l) => l.trim().toUpperCase())),
  ];
  return (
    <div className="trip-container">
      <div className="trip-card">
        <form onSubmit={onSubmit}>
          <div className="grid">
            {/* CUSTOMER */}
            <div className="form-row">
              <div className="form-group">
                <label>Select Customer</label>
                <select
                  name="customerId"
                  value={formData.customerId}
                  onChange={onCustomerChange}
                >
                  <option value="">Select</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="or-text">OR</div>

              <div className="form-group">
                <label>Customer Name</label>
                <input
                  type="text"
                  name="localCustomerName"
                  value={formData.localCustomerName}
                  onChange={onChange}
                  placeholder="Enter customer name"
                />
              </div>
            </div>

            {/* VEHICLE */}
            <div className="form-row">
              <div className="form-group">
                <label>Select Vehicle</label>
                <select
                  name="vehicleId"
                  value={formData.vehicleId || ""}
                  onChange={onVehicleChange}
                >
                  <option value="">Select</option>
                  {formData.vehicles?.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.vehicleNumber}
                    </option>
                  ))}
                </select>
              </div>

              <div className="or-text">OR</div>

              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber || ""}
                  onChange={onChange}
                  placeholder="Enter vehicle number"
                />
              </div>
            </div>

            {/* DRIVER */}
            <div className="form-row">
              <div className="form-group itexts">
                <label>Select Driver</label>
                <select
                  name="driverId"
                  value={formData.driverId}
                  onChange={onChange}
                >
                  <option value="">Select</option>
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Trip Commission</label>
                <input
                  type="text"
                  name="tripCommission"
                  value={formData.tripCommission}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Trip Details */}
            <div className="form-row">
              <div className="form-group">
                <label>Trip Expense</label>
                <input
                  type="text"
                  name="tripExpense"
                  value={formData.tripExpense}
                  onChange={onChange}
                />
              </div>
              <div className="form-group">
                <label>Bill Amount (₹)</label>
                <input
                  type="number"
                  name="tripCharges"
                  value={formData.tripCharges}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Freight</label>
                <input
                  type="text"
                  name="tripGoods"
                  value={formData.tripGoods}
                  onChange={onChange}
                />
              </div>
              <div className="form-group">
                <label>Trip Date</label>
                <input
                  type="date"
                  name="addTripDate"
                  value={formData.addTripDate}
                  onChange={onChange}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group autocomplete">
                <label>From Location</label>
                <input
                  required
                  type="text"
                  name="fromLocation"
                  value={formData.fromLocation}
                  onChange={(e) => {
                    onChange(e);
                    setFromSuggestions(filterLocations(e.target.value));
                  }}
                  onBlur={() => setFromSuggestions([])}
                />

                {fromSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {fromSuggestions.map((loc) => (
                      <li
                        key={loc}
                        onMouseDown={() => {
                          onChange({
                            target: { name: "fromLocation", value: loc },
                          });
                          setFromSuggestions([]);
                        }}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="form-group autocomplete">
                <label>To Location</label>
                <input
                  type="text"
                  required
                  name="toLocation"
                  value={formData.toLocation}
                  onChange={(e) => {
                    onChange(e);
                    setToSuggestions(filterLocations(e.target.value));
                  }}
                  onBlur={() => setToSuggestions([])}
                />

                {toSuggestions.length > 0 && (
                  <ul className="suggestions">
                    {toSuggestions.map((loc) => (
                      <li
                        key={loc}
                        onMouseDown={() => {
                          onChange({
                            target: { name: "toLocation", value: loc },
                          });
                          setToSuggestions([]);
                        }}
                      >
                        {loc}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Consignor GST No.</label>
                <input
                  type="text"
                  name="consignorGST"
                  value={formData.consignorGST}
                  onChange={onChange}
                />
              </div>
              <div className="form-group">
                <label>Consignee GST No.</label>
                <input
                  type="text"
                  name="consigneeGST"
                  value={formData.consigneeGST}
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Create Bilty</label>
                <select
                  name="createBilty"
                  value={formData.createBilty}
                  onChange={onChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>

              {formData.createBilty === "Yes" && (
                <div className="form-group full-width">
                  <label>Lorry No (Auto)</label>
                  <input type="text" value={formData.lorryNo} disabled />
                </div>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Special Note</label>
                <input
                  type="text"
                  name="specialNotes"
                  value={formData.specialNotes}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Submit */}
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
}
