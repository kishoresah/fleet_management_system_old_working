import React, { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate, useParams } from "react-router-dom";
import type Customer from "../../types/Customer";
import { ownerLists } from "../../constants";

const EditCustomer: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [users, setUsers] =
    useState<{ uid: string; displayName: string }[]>(ownerLists);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState<Customer>({
    name: "",
    address: "",
    gstNumber: "",
    city: "",
    state: "",
    country: "India",
    panNumber: "",
    contactPerson: "",
    primaryPhone: "",
    ownerUserId: "",
  });

  useEffect(() => {
    const loadUsers = async () => {
      const snap = await getDocs(collection(db, "users"));
      setUsers(
        snap.docs.map((doc) => ({
          uid: doc.id,
          displayName: doc.data().displayName,
        }))
      );
    };

    const loadCustomer = async () => {
      if (!id) return;
      const snap = await getDoc(doc(db, "customers", id));
      if (snap.exists()) setFormData(snap.data() as Customer);
      setLoading(false);
    };

    loadUsers();
    loadCustomer();
  }, [id]);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Customer Name is required";
    if (!formData.ownerUserId) newErrors.ownerUserId = "Select Owner";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!id) return;

    await updateDoc(doc(db, "customers", id), formData);
    navigate("/customers");
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;

  return (
    <div className="add-customer-container">
      <h2>Edit Customer</h2>

      {/* Error messages */}
      {errors.name && <p className="error-msg">{errors.name}</p>}
      {errors.ownerUserId && <p className="error-msg">{errors.ownerUserId}</p>}

      <form className="customer-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Customer Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <small className="error-msg">{errors.name}</small>}
        </div>

        <div className="form-group">
          <label>Contact Person</label>
          <input
            type="text"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
          />
        </div>

        <div className="form-group full">
          <label>Address</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>GST Number</label>
          <input
            type="text"
            name="gstNumber"
            value={formData.gstNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>PAN Number</label>
          <input
            type="text"
            name="panNumber"
            value={formData.panNumber}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Primary Phone</label>
          <input
            type="text"
            name="primaryPhone"
            value={formData.primaryPhone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Owner</label>
          <select
            name="ownerUserId"
            value={formData.ownerUserId}
            onChange={handleChange}
          >
            <option value="">-- Select Owner --</option>
            {users.map((u) => (
              <option key={u.uid} value={u.uid}>
                {u.displayName}
              </option>
            ))}
          </select>
          {errors.ownerUserId && (
            <small className="error-msg">{errors.ownerUserId}</small>
          )}
        </div>

        <button type="submit" className="submit-btn">
          Update Customer
        </button>
      </form>
    </div>
  );
};

export default EditCustomer;
