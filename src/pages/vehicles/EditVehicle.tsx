import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate, useParams } from "react-router-dom";
import type Vehicle from "../../types/Vehicle";
import VehicleForm from "./VehicleForm";

const EditVehicle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Vehicle>({
    vehicleNumber: "",
    vehicleType: "",
    brand: "",
    model: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (!id) return;

    const loadVehicle = async () => {
      const snap = await getDoc(doc(db, "vehicles", id));
      if (snap.exists()) {
        setFormData(snap.data() as Vehicle);
      }
    };

    loadVehicle();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await updateDoc(doc(db, "vehicles", id!), {
      ...formData,
      updatedAt: serverTimestamp(),
    });

    navigate("/vehicleList");
  };

  return (
    <div className="add-vehicle-container">
      <h2>Edit Vehicle</h2>

      <VehicleForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Update Vehicle"
      />
    </div>
  );
};

export default EditVehicle;
