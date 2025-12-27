import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  MenuItem,
  Typography,
  Grid,
} from "@mui/material";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import type Customer from "../../types/Customer";
import { ownerLists } from "../../constants";
import { capitalizeWords } from "../../utils";

const AddCustomer: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] =
    useState<{ uid: string; displayName: string }[]>(ownerLists);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
    loadUsers();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Customer Name is required";
    if (!formData.ownerUserId) newErrors.ownerUserId = "Select Owner";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await addDoc(collection(db, "customers"), {
      ...formData,
      createdAt: serverTimestamp(),
    });

    navigate("/customers");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: capitalizeWords(e.target.value),
    }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  return (
    <Box
      sx={{
        // maxWidth: 900,
        mx: "auto",
        p: 2,
        ml: { xs: 1, sm: 1 }, // ❗ No extra margin from side menu
      }}
    >
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Add Customer
      </Typography>

      <Card sx={{ p: 2, boxShadow: "0px 2px 8px rgba(0,0,0,0.1)" }}>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Customer Name */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Customer Name"
                  fullWidth
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={!!errors.name}
                  helperText={errors.name}
                />
              </Grid>

              {/* Contact Person */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Contact Person"
                  fullWidth
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </Grid>

              {/* Address */}
              <Grid item xs={12}>
                <TextField
                  label="Address"
                  fullWidth
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  multiline
                  rows={3}
                />
              </Grid>

              {/* City */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="City"
                  fullWidth
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              </Grid>

              {/* State */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="State"
                  fullWidth
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              </Grid>

              {/* Country */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Country"
                  fullWidth
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              </Grid>

              {/* GST */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="GST Number"
                  fullWidth
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                />
              </Grid>

              {/* PAN */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="PAN Number"
                  fullWidth
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                />
              </Grid>

              {/* Phone */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Primary Phone"
                  fullWidth
                  name="primaryPhone"
                  value={formData.primaryPhone}
                  onChange={handleChange}
                />
              </Grid>

              {/* Owner */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Owner"
                  select
                  fullWidth
                  name="ownerUserId"
                  value={formData.ownerUserId}
                  onChange={handleChange}
                  error={!!errors.ownerUserId}
                  helperText={errors.ownerUserId}
                >
                  <MenuItem value="">-- Select Owner --</MenuItem>
                  {users.map((u) => (
                    <MenuItem key={u.uid} value={u.uid}>
                      {u.displayName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* Submit */}
              <Grid item xs={12}>
                <Button variant="contained" fullWidth type="submit">
                  Save Customer
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AddCustomer;
