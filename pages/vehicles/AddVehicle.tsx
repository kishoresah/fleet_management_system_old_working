import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate } from "react-router-dom";
import type Vehicle from "../../types/Vehicle";
import VehicleForm from "./VehicleForm";

const AddVehicle: React.FC = () => {
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<Vehicle>({
    vehicleNumber: "",
    vehicleType: "",
    brand: "",
    model: "",
    status: "ACTIVE",
  });

  const validate = () => {
    const e: Record<string, string> = {};

    if (!formData.vehicleNumber?.trim())
      e.vehicleNumber = "Vehicle number is required";

    if (!formData.vehicleType?.trim())
      e.vehicleType = "Vehicle type is required";

    if (!formData.brand?.trim()) e.brand = "Brand is required";

    if (!formData.model?.trim()) e.model = "Model is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await addDoc(collection(db, "vehicles"), {
      ...formData,
      createdAt: serverTimestamp(),
    });

    navigate("/vehicleList");
  };

  return (
    <div className="add-vehicle-container">
      <h2>Add Vehicle</h2>

      <VehicleForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Save Vehicle"
      />
    </div>
  );
};

export default AddVehicle;
