import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Layout from "./layout/DashboardLayout";
import CustomerList from "./pages/customers/CustomerList";
import AddCustomer from "./pages/customers/AddCustomer";
import EditCustomer from "./pages/customers/EditCustomer";
import ProtectedRoute from "./components/ProtectedRoutes";
import AddDriver from "./pages/drivers/AddDriver";
import EditDriver from "./pages/drivers/EditDriver";
import DriverList from "./pages/drivers/DriverList";
import ListInvoices from "./pages/invoice/ListInvoices";
import AddInvoice from "./pages/invoice/AddInvoice";
import EditInvoice from "./pages/invoice/EditInvoice";
import OutstandingReport from "./pages/reports/OutstandingReport";
import AddPayment from "./pages/invoice/AddPayment";
import InvoiceDetails from "./pages/invoice/InvoiceDetails";
import AddDriverPayment from "./pages/drivers/AddDriverPayment";
import DriverPaymentList from "./pages/drivers/DriverPaymentList";
import DriverPaymentListByDriver from "./pages/drivers/DriverPaymentListByDriver";
import AddTrip from "./pages/dailyTrips/AddTrip";
import TripList from "./pages/dailyTrips/TripList";
import EditDailyTrip from "./pages/dailyTrips/EditTrip";
import VehicleList from "./pages/vehicles/VehicleList";
import AddVehicle from "./pages/vehicles/AddVehicle";
import EditVehicle from "./pages/vehicles/EditVehicle";
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Section - Only logged in users can see */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<CustomerList />} />
          <Route path="/customers" element={<CustomerList />} />
          <Route path="/add-customer" element={<AddCustomer />} />
          <Route path="/edit-customer/:id" element={<EditCustomer />} />
          <Route path="/trip-list" element={<TripList />} />
          <Route path="/add-payment/:id" element={<AddPayment />} />
          <Route path="/invoice/:id" element={<InvoiceDetails />} />

          <Route path="/drivers" element={<DriverList />} />
          <Route path="/add-driver" element={<AddDriver />} />
          <Route path="/edit-driver/:id" element={<EditDriver />} />

          <Route path="/vehicleList" element={<VehicleList />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/edit-vehicle/:id" element={<EditVehicle />} />

          <Route path="/invoices" element={<ListInvoices />} />
          <Route path="/add-invoice" element={<AddInvoice />} />
          <Route path="/edit-invoice/:id" element={<EditInvoice />} />
          <Route path="/reports/outstanding" element={<OutstandingReport />} />
          <Route
            path="/add-driver-payment/:driverId"
            element={<AddDriverPayment />}
          />

          <Route path="/add-daily-trip" element={<AddTrip />} />
          <Route path="/edit-daily-trip/:id" element={<EditDailyTrip />} />
          <Route path="/driver-payments" element={<DriverPaymentList />} />
          <Route
            path="/driver-payments/:driverId"
            element={<DriverPaymentListByDriver />}
          />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
