import React from "react";
import type Vehicle from "../../types/Vehicle";

interface Props {
  formData: Vehicle;
  errors: Record<string, string>;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}

const VehicleForm: React.FC<Props> = ({
  formData,
  errors,
  onChange,
  onSubmit,
  submitText,
}) => {
  return (
    <div className="trip-container">
      <div className="trip-card">
        <form onSubmit={onSubmit}>
          <div className="grid">
            {/* Vehicle Number & Type */}
            <div className="form-row">
              <div className="form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicleNumber"
                  value={formData.vehicleNumber}
                  onChange={onChange}
                  placeholder="KA01AB1234"
                />
                {errors.vehicleNumber && (
                  <small className="error-msg">{errors.vehicleNumber}</small>
                )}
              </div>

              <div className="form-group">
                <label>Vehicle Type</label>
                <input
                  type="text"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={onChange}
                  placeholder="Car / Van / Truck"
                />
                {errors.vehicleType && (
                  <small className="error-msg">{errors.vehicleType}</small>
                )}
              </div>
            </div>

            {/* Brand & Model */}
            <div className="form-row">
              <div className="form-group">
                <label>Brand</label>
                <input
                  type="text"
                  name="brand"
                  value={formData.brand}
                  onChange={onChange}
                  placeholder="Maruti, Tata, Hyundai"
                />
                {errors.brand && (
                  <small className="error-msg">{errors.brand}</small>
                )}
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={onChange}
                  placeholder="Swift, Nexon"
                />
                {errors.model && (
                  <small className="error-msg">{errors.model}</small>
                )}
              </div>
            </div>

            {/* Manufacturing Year & Color */}
            <div className="form-row">
              <div className="form-group">
                <label>Manufacturing Year</label>
                <input
                  type="number"
                  name="manufacturingYear"
                  value={formData.manufacturingYear || ""}
                  onChange={onChange}
                  placeholder="2022"
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  value={formData.color || ""}
                  onChange={onChange}
                  placeholder="White"
                />
              </div>
            </div>

            {/* Owner Details */}
            <div className="form-row">
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="ownerName"
                  value={formData.ownerName || ""}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Owner Phone</label>
                <input
                  type="text"
                  name="ownerPhone"
                  value={formData.ownerPhone || ""}
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Insurance */}
            <div className="form-row">
              <div className="form-group">
                <label>Insurance Number</label>
                <input
                  type="text"
                  name="insuranceNumber"
                  value={formData.insuranceNumber || ""}
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Insurance Expiry</label>
                <input
                  type="date"
                  name="insuranceExpiry"
                  value={
                    formData.insuranceExpiry
                      ? new Date(formData.insuranceExpiry)
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={onChange}
                />
              </div>
            </div>

            {/* Fitness / Permit / Pollution */}
            <div className="form-row">
              <div className="form-group">
                <label>Fitness Expiry</label>
                <input
                  type="date"
                  name="fitnessExpiry"
                  value={
                    formData.fitnessExpiry
                      ? new Date(formData.fitnessExpiry)
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={onChange}
                />
              </div>

              <div className="form-group">
                <label>Permit Expiry</label>
                <input
                  type="date"
                  name="permitExpiry"
                  value={
                    formData.permitExpiry
                      ? new Date(formData.permitExpiry)
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={onChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pollution Expiry</label>
                <input
                  type="date"
                  name="pollutionExpiry"
                  value={
                    formData.pollutionExpiry
                      ? new Date(formData.pollutionExpiry)
                          .toISOString()
                          .slice(0, 10)
                      : ""
                  }
                  onChange={onChange}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label>Status</label>
                <select
                  name="status"
                  value={formData.status || "ACTIVE"}
                  onChange={onChange}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="MAINTENANCE">Maintenance</option>
                </select>
              </div>
            </div>

            {/* Submit */}
            <div className="form-row">
              <button type="submit" className="submit-btn">
                {submitText}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleForm;
