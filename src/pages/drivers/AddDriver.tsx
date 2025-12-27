import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import type Driver from "../../types/Driver";
import DriverForm from "./DriverForm";

const AddDriver: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Driver>({
    name: "",
    licenseNumber: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    joiningDate: "", // ✅ added
    salary: 0, // ✅ added
  });

  const validate = () => {
    const e: Record<string, string> = {};
    if (!formData.name.trim()) e.name = "Driver name is required";
    if (!formData.joiningDate) e.joiningDate = "Joining date is required";
    if (!formData.salary) e.salary = "Salary is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await addDoc(collection(db, "drivers"), {
      ...formData,
      salary: Number(formData.salary), // ensure stored as number
      createdAt: serverTimestamp(),
    });

    navigate("/drivers");
  };

  return (
    <div className="add-customer-container">
      <h2>Add Driver</h2>
      <DriverForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Save Driver"
      />
    </div>
  );
};

export default AddDriver;
