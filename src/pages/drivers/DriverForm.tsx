import React from "react";
import type Driver from "../../types/Driver";

interface Props {
  formData: Driver;
  errors: Record<string, string>;
  users?: { uid: string; displayName: string }[];
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
}

const DriverForm: React.FC<Props> = ({
  formData,
  errors,
  onChange,
  onSubmit,
  submitText,
}) => {
  return (
    <form className="customer-form" onSubmit={onSubmit}>
      {/* Driver Name */}
      <div className="form-group">
        <label>Driver Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={onChange}
          placeholder="Enter driver name"
        />
        {errors.name && <small className="error-msg">{errors.name}</small>}
      </div>

      {/* License Number */}
      <div className="form-group">
        <label>License Number</label>
        <input
          type="text"
          name="licenseNumber"
          value={formData.licenseNumber}
          onChange={onChange}
          placeholder="Enter license number"
        />
      </div>

      {/* Phone Number */}
      <div className="form-group">
        <label>Phone Number</label>
        <input
          type="text"
          name="phone"
          value={formData.phone}
          onChange={onChange}
          placeholder="Enter phone number"
        />
      </div>

      {/* Address */}
      <div className="form-group full">
        <label>Address</label>
        <textarea
          name="address"
          value={formData.address}
          onChange={onChange}
          placeholder="Enter address"
        ></textarea>
      </div>

      {/* City */}
      <div className="form-group">
        <label>City</label>
        <input
          type="text"
          name="city"
          value={formData.city}
          onChange={onChange}
          placeholder="Enter city"
        />
      </div>

      {/* State */}
      <div className="form-group">
        <label>State</label>
        <input
          type="text"
          name="state"
          value={formData.state}
          onChange={onChange}
          placeholder="Enter state"
        />
      </div>

      {/* Joining Date */}
      <div className="form-group">
        <label>Joining Date</label>
        <input
          type="date"
          name="joiningDate"
          value={formData.joiningDate || ""}
          onChange={onChange}
        />
        {errors.joiningDate && (
          <small className="error-msg">{errors.joiningDate}</small>
        )}
      </div>

      {/* Salary */}
      <div className="form-group">
        <label>Salary (₹)</label>
        <input
          type="number"
          name="salary"
          value={formData.salary || ""}
          onChange={onChange}
          placeholder="Enter salary amount"
        />
        {errors.salary && <small className="error-msg">{errors.salary}</small>}
      </div>

      <button type="submit" className="submit-btn">
        {submitText}
      </button>
    </form>
  );
};

export default DriverForm;
