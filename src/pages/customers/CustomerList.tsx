import { useEffect, useState } from "react";
import {
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Stack,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../../firebaseConfig";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import { getownerName } from "../../utils";

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    name: "",
    city: "",
    contact: "",
    referBy: "",
  });

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md")); // MOBILE DETECTION

  useEffect(() => {
    const fetchData = async () => {
      const snap = await getDocs(collection(db, "customers"));
      setCustomers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    };
    fetchData();
  }, []);

  const deleteCustomer = async (id) => {
    const userRole = localStorage.getItem("role");
    if (userRole != 1) return alert("Only Admin can delete customers");

    await deleteDoc(doc(db, "customers", id));
    setCustomers(customers.filter((c) => c.id !== id));
  };

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.city.toLowerCase().includes(search.toLowerCase()) ||
      c.primaryPhone.toLowerCase().includes(search.toLowerCase()) ||
      getownerName(c.ownerUserId).toLowerCase().includes(search.toLowerCase());

    const matchesFilters =
      c.name.toLowerCase().includes(filters.name.toLowerCase()) &&
      c.city.toLowerCase().includes(filters.city.toLowerCase()) &&
      c.primaryPhone.toLowerCase().includes(filters.contact.toLowerCase()) &&
      getownerName(c.ownerUserId)
        .toLowerCase()
        .includes(filters.referBy.toLowerCase());

    return matchesSearch && matchesFilters;
  });

  return (
    <Box sx={{ p: 1 }}>
      <Button variant="contained" onClick={() => navigate("/add-customer")}>
        Add Customer
      </Button>

      {/* GLOBAL SEARCH */}
      <Box sx={{ mt: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search in all fields..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </Box>

      {/* FILTERS FOR MOBILE */}
      {isMobile && (
        <Box sx={{ mt: 2 }}>
          <Stack spacing={1}>
            <TextField
              size="small"
              label="Filter Name"
              value={filters.name}
              onChange={(e) =>
                setFilters((p) => ({ ...p, name: e.target.value }))
              }
            />
            <TextField
              size="small"
              label="Filter City"
              value={filters.city}
              onChange={(e) =>
                setFilters((p) => ({ ...p, city: e.target.value }))
              }
            />
            <TextField
              size="small"
              label="Filter Contact"
              value={filters.contact}
              onChange={(e) =>
                setFilters((p) => ({ ...p, contact: e.target.value }))
              }
            />
            <TextField
              size="small"
              label="Filter Refer By"
              value={filters.referBy}
              onChange={(e) =>
                setFilters((p) => ({ ...p, referBy: e.target.value }))
              }
            />
          </Stack>
        </Box>
      )}

      {/* DESKTOP VIEW — TABLE */}
      {!isMobile && (
        <Table sx={{ mt: 3 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>City</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Refer By</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>

            {/* FILTER INPUTS */}
            <TableRow>
              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter Name"
                  value={filters.name}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter City"
                  value={filters.city}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, city: e.target.value }))
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter Contact"
                  value={filters.contact}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, contact: e.target.value }))
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  variant="standard"
                  placeholder="Filter Refer By"
                  value={filters.referBy}
                  onChange={(e) =>
                    setFilters((p) => ({ ...p, referBy: e.target.value }))
                  }
                />
              </TableCell>

              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredCustomers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.city}</TableCell>
                <TableCell>{c.primaryPhone}</TableCell>
                <TableCell>{getownerName(c.ownerUserId)}</TableCell>
                <TableCell>
                  <Button
                    size="small"
                    onClick={() => navigate(`/edit-customer/${c.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => deleteCustomer(c.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* MOBILE VIEW — CARDS */}
      {isMobile && (
        <Box sx={{ mt: 3 }}>
          {filteredCustomers.map((c) => (
            <Card key={c.id} sx={{ mb: 2, p: 1 }}>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Typography color="text.secondary">{c.city}</Typography>
                <Typography>Contact: {c.primaryPhone}</Typography>
                <Typography>Refer By: {getownerName(c.ownerUserId)}</Typography>

                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/edit-customer/${c.id}`)}
                  >
                    <EditIcon />
                  </IconButton>

                  <IconButton
                    color="error"
                    onClick={() => deleteCustomer(c.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
