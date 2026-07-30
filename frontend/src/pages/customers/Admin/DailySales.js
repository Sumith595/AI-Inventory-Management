import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/Sidebar";
import {
  TextField,
  Button,
  MenuItem,
  Grid
} from "@mui/material";
import { getProducts } from "../../../services/productServices";
import {saveDailySales, getSalesHistory} from "../../../services/salesservice";
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography
} from "@mui/material";

import {
    Snackbar,
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress
} from "@mui/material";


function DailySales() {

    const [products, setProducts] = useState([]);

    const [selectedProduct, setSelectedProduct] = useState("");

    const [unitsSold, setUnitsSold] = useState("");

    const [currentStock, setCurrentStock] = useState(0);

    const [history, setHistory] = useState([]);

    const [loading, setLoading] = useState(false);

    const [snackbarOpen, setSnackbarOpen] = useState(false);

    const [snackbarMessage, setSnackbarMessage] = useState("");

    const [snackbarSeverity, setSnackbarSeverity] = useState("success");

    useEffect(() => {
        loadProducts();
        loadSalesHistory();
    }, []);

    const loadProducts = async () => {
        try {
            const response = await getProducts();
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const handleProductChange = (event) => {
        const id = Number(event.target.value);
        setSelectedProduct(id);
        const product = products.find((p) => p.id === id);

        if (product) {
            setCurrentStock(product.quantity);
        } else {
            setCurrentStock(0);
        }
    };

    const handleUnitsSoldChange = (event) => {
        setUnitsSold(event.target.value);
    };

const handleSaveSales = async () => {

    if (!selectedProduct) {

        setSnackbarSeverity("error");
        setSnackbarMessage("Please select a product.");
        setSnackbarOpen(true);
        return;

    }

    if (Number(unitsSold) <= 0) {

        setSnackbarSeverity("error");
        setSnackbarMessage("Units Sold must be greater than zero.");
        setSnackbarOpen(true);
        return;

    }

    if (Number(unitsSold) > currentStock) {

        setSnackbarSeverity("error");
        setSnackbarMessage("Cannot sell more than available stock.");
        setSnackbarOpen(true);
        return;

    }

    try {

        setLoading(true);

        await saveDailySales({

            product_id: selectedProduct,

            units_sold: Number(unitsSold)

        });

        setSnackbarSeverity("success");
        setSnackbarMessage("Daily Sales Saved Successfully!");
        setSnackbarOpen(true);

        setUnitsSold("");

        await loadProducts();
        await loadSalesHistory();

        const response = await getProducts();

        const updated = response.data.find(
            p => p.id === selectedProduct
        );

        if(updated){

            setCurrentStock(updated.quantity);

        }

    }

    catch(error){

        setSnackbarSeverity("error");
        setSnackbarMessage(
            error.response?.data?.detail || "Error Saving Sales"
        );
        setSnackbarOpen(true);

    }

    finally{

        setLoading(false);

    }

};

    


const loadSalesHistory = async () => {

    try {

        const response = await getSalesHistory();

        setHistory(response.data);

    } catch (error) {

        console.error(error);

    }

};



    return (

        <div
            style={{
                display: "flex",
                minHeight: "100vh",
                background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
                color: '#f8fafc'
            }}
        >

            <Sidebar />

            <Box
                sx={{
                    flex: 1,
                    p: { xs: 3, md: 5 },
                    maxWidth: 1300,
                    mx: 'auto',
                    width: '100%',
                }}
            >
                <Box
                    sx={{
                        textAlign: 'center',
                        mb: 4,
                    }}
                >
                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900, mb: 1 }}>
                        Daily Sales
                    </Typography>
                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, maxWidth: 760, mx: 'auto' }}>
                        Capture sales, monitor stock, and review today’s performance in one polished view.
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 4, alignItems: 'flex-start', flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                    <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                        <Card
                            elevation={12}
                            sx={{
                                borderRadius: 6,
                                background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))',
                                border: '1px solid rgba(255,255,255,0.12)',
                                backdropFilter: 'blur(12px)',
                                minHeight: 420,
                                boxShadow: '0 20px 40px rgba(2,6,23,0.35)'
                            }}
                        >
                            <CardContent sx={{ p: 4 }}>
                                <Typography variant="h5" sx={{ mb: 2, color: '#eef2ff', fontWeight: 800 }}>
                                    Record Today's Sales
                                </Typography>

                                <TextField
                                    select
                                    label="Select Product"
                                    fullWidth
                                    margin="normal"
                                    value={selectedProduct}
                                    onChange={handleProductChange}
                                    sx={{ background: 'rgba(255,255,300,0.08)', borderRadius: 2 }}
                                >
                                    {products.map((product) => (
                                        <MenuItem key={product.id} value={product.id}>
                                            {product.name}
                                        </MenuItem>
                                    ))}
                                </TextField>

                                <Typography sx={{ mt: 2, color: '#ffffff', fontWeight: 700 }}>
                                    Current Stock: {currentStock}
                                </Typography>

                                <TextField
                                    label="Units Sold"
                                    type="number"
                                    fullWidth
                                    margin="normal"
                                    value={unitsSold}
                                    onChange={(e) => setUnitsSold(e.target.value)}
                                    sx={{ background: 'rgba(255,255,255,0.08)', borderRadius: 2 }}
                                />

                                <Button
                                    variant="contained"
                                    fullWidth
                                    disabled={!selectedProduct || !unitsSold || loading}
                                    onClick={handleSaveSales}
                                    sx={{ mt: 2, py: 1.5, fontWeight: 700, boxShadow: '0 18px 30px rgba(99,102,241,0.24)' }}
                                >
                                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Save Sales'}
                                </Button>

                                <Box
                                    sx={{
                                        mt: 3,
                                        p: 3,
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.08)',
                                        border: '1px solid rgba(255,255,255,0.14)',
                                    }}
                                >
                                    <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                                        Sales Tip
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontSize: 14 }}>
                                        Record sales as soon as inventory moves and keep stock levels fresh for accurate alerts.
                                    </Typography>
                                </Box>
                            </CardContent>
                        </Card>
                        <Box sx={{ mt: 3, display: 'flex', gap: 3, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
                            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                <Card
                                    elevation={10}
                                    sx={{
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(59,130,246,0.22), rgba(99,102,241,0.18))',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 140,
                                    }}
                                >
                                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 1, fontWeight: 700 }}>
                                            📊 Units Sold
                                        </Typography>
                                        <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, lineHeight: 1 }}>
                                            {history.reduce((sum, item) => sum + item.units_sold, 0)}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                            <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                                <Card
                                    elevation={10}
                                    sx={{
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.22), rgba(6,182,212,0.16))',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 140,
                                    }}
                                >
                                    <CardContent sx={{ p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                                        <Typography variant="subtitle2" sx={{ color: '#ffffff', mb: 1, fontWeight: 700 }}>
                                            🧾 Transactions
                                        </Typography>
                                        <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, lineHeight: 1 }}>
                                            {history.length}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Box>
                        </Box>
                    </Box>

                    <Box sx={{ width: { xs: '100%', md: '48%' } }}>
                        <Grid container spacing={3}>
                            <Grid xs={12}>
                                <Paper
                                    elevation={3}
                                    sx={{
                                        p: 3,
                                        borderRadius: 4,
                                        background: 'rgba(255,255,255,0.95)',
                                        minHeight: 420,
                                        overflow: 'hidden'
                                    }}
                                >
                                    <Typography variant="h5" mb={2} sx={{ fontWeight: 900 }}>
                                        Sales History
                                    </Typography>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: 'transparent' } }}>
                                                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Units Sold</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Remaining Stock</TableCell>
                                                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {history.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={4} align="center">
                                                            No Sales Recorded
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    history.map((sale, idx) => (
                                                        <TableRow key={sale.id} sx={{ background: idx % 2 === 0 ? 'transparent' : 'rgba(15,23,42,0.03)' }}>
                                                            <TableCell sx={{ py: 1 }}>{sale.product_name}</TableCell>
                                                            <TableCell sx={{ py: 1 }}>{sale.units_sold}</TableCell>
                                                            <TableCell sx={{ py: 1 }}>{sale.stock_remaining}</TableCell>
                                                            <TableCell sx={{ py: 1 }}>{sale.date}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                </Paper>
                            </Grid>
                            {/* Transactions moved to left column under Units Sold */}
                        </Grid>
                    </Box>
                </Box>

                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={3000}
                    onClose={() => setSnackbarOpen(false)}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                >
                    <Alert severity={snackbarSeverity} variant="filled">
                        {snackbarMessage}
                    </Alert>
                </Snackbar>
            </Box>
        </div>
    );
}

export default DailySales;