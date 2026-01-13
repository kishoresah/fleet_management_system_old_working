import {
  AppBar,
  Toolbar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet, Link, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfigTest";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import { COMPANY_NAME } from "../constants";

const drawerWidth = 220;

export default function DashboardLayout() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // mobile/tablet

  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerContent = (
    <List>
      <ListItem
        button
        component={Link}
        to="/add-daily-trip"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Add Daily trip" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/trip-list"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Daily trip List" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/customers"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Customer List" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/drivers"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Driver List" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/invoices"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Invoice List" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/add-invoice"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Add Invoice" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/reports/outstanding"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="Due Payment" />
      </ListItem>

      <ListItem
        button
        component={Link}
        to="/vehicleList"
        onClick={() => isMobile && setMobileOpen(false)}
      >
        <ListItemText primary="VehicleList" />
      </ListItem>
    </List>
  );

  return (
    <Box sx={{ display: "flex" }}>
      {/* Top App Bar */}
      <AppBar position="fixed" sx={{ zIndex: 1201 }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Hamburger only on mobile */}
          {isMobile && (
            <IconButton color="inherit" onClick={handleDrawerToggle}>
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1, ml: isMobile ? 1 : 0 }}>
            {COMPANY_NAME}
          </Typography>

          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Left Drawer */}
      {isMobile ? (
        // MOBILE DRAWER (temporary)
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      ) : (
        // DESKTOP DRAWER (permanent)
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          <Toolbar />
          {drawerContent}
        </Drawer>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          ml: { xs: 0, sm: "10px" }, // 👈 FIX — only 10px margin-left on desktop
          background: "#f9fafb",
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Outlet />
        <Box sx={{ textAlign: "center", mt: 4, color: "gray" }}>
          {COMPANY_NAME} © {new Date().getFullYear()}
        </Box>
      </Box>
    </Box>
  );
}
