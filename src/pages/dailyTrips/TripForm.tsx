import React from "react";
import {
  Box,
  Grid,
  TextField,
  Button,
  Card,
  CardContent,
  Typography,
} from "@mui/material";

export default function TripForm({
  formData,
  customers,
  drivers,
  onChange,
  onCustomerChange,
  onSubmit,
  submitText,
}) {
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Card sx={{ p: 1 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Add Trip
          </Typography>

          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
              {/* CUSTOMER */}
              <Grid item xs={12} md={6}>
                <label className="label">Select Customer</label>
                <select
                  className="full-select"
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
              </Grid>

              {/* DRIVER */}
              <Grid item xs={12} md={6}>
                <label className="label">Select Driver</label>
                <select
                  className="full-select"
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
              </Grid>

              {/* FROM LOCATION */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="From Location"
                  name="fromLocation"
                  fullWidth
                  size="small"
                  value={formData.fromLocation}
                  onChange={onChange}
                />
              </Grid>

              {/* TO LOCATION */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="To Location"
                  name="toLocation"
                  fullWidth
                  size="small"
                  value={formData.toLocation}
                  onChange={onChange}
                />
              </Grid>

              {/* CONSIGNOR GST */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Consignor GST No."
                  name="consignorGST"
                  fullWidth
                  size="small"
                  value={formData.consignorGST}
                  onChange={onChange}
                />
              </Grid>

              {/* CONSIGNEE GST */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Consignee GST No."
                  name="consigneeGST"
                  fullWidth
                  size="small"
                  value={formData.consigneeGST}
                  onChange={onChange}
                />
              </Grid>

              {/* INVOICE VALUE */}
              <Grid item xs={12} md={6}>
                <TextField
                  label="Invoice Value Amount"
                  type="number"
                  name="invoiceValue"
                  fullWidth
                  size="small"
                  value={formData.invoiceValue}
                  onChange={onChange}
                />
              </Grid>

              {/* CREATE BILTY */}
              <Grid item xs={12} md={6}>
                <label className="label">Create Bilty</label>
                <select
                  className="full-select"
                  name="createBilty"
                  value={formData.createBilty}
                  onChange={onChange}
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </Grid>

              {/* LORRY NUMBER */}
              <Grid item xs={12}>
                <TextField
                  label="Lorry No (Auto)"
                  fullWidth
                  size="small"
                  value={formData.lorryNo}
                  disabled
                />
              </Grid>

              {/* SUBMIT BUTTON */}
              <Grid item xs={12}>
                <Button variant="contained" fullWidth type="submit">
                  {submitText}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
