import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebaseConfigTest";
import { useNavigate, useParams } from "react-router-dom";
import type Driver from "../../types/Driver";
import DriverForm from "./DriverForm";

const EditDriver: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<Driver>({
    name: "",
    licenseNumber: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    salary: 0,
    joiningDate: "",
  });

  useEffect(() => {
    const load = async () => {
      const snap = await getDoc(doc(db, "drivers", id!));
      if (snap.exists()) setFormData(snap.data() as Driver);
    };
    load();
  }, [id]);

  const handleChange = (e: any) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateDoc(doc(db, "drivers", id!), formData);
    navigate("/drivers");
  };

  return (
    <div className="add-customer-container">
      <h2>Edit Driver</h2>
      <DriverForm
        formData={formData}
        errors={errors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        submitText="Update Driver"
      />
    </div>
  );
};

export default EditDriver;
