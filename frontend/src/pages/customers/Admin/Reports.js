import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "../../../components/Sidebar";
import { getReportData } from "../../../services/reportServices";

import {
    Box,
    Grid,
    Card,
    CardContent,
    Typography,
    Button
} from "@mui/material";
import Inventory2Icon from '@mui/icons-material/Inventory2';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import InventoryIcon from '@mui/icons-material/Inventory';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';

function Reports() {

    const location = useLocation();
    const [reportData, setReportData] = useState(null);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReportData();
    }, [location.pathname]);

    const loadReportData = async () => {

        try {

            const response = await getReportData();

            setReportData(response.data);

        } catch (error) {

            console.log(error);

        }

    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadReportData();
        setRefreshing(false);
    };

    if (!reportData) {
        return <h2>Loading...</h2>;
    }

    return (

        <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(180deg, #4e47c1 0%, #5d5cd8 42%, #422b8a 100%)" }}>

            <Sidebar />

            <div
                style={{
                    flex: 1,
                    padding: "40px 44px",
                    display: "flex",
                    flexDirection: "column",
                    gap: 28,
                }}
            >

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', md: 'center' },
                        gap: 2,
                    }}
                >
                    <Box>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', mb: 1 }}>
                            Reports
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 16, maxWidth: 640 }}>
                            Inventory, sales and AI prediction insights for better ordering and stock control.
                        </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleRefresh}
                            disabled={refreshing}
                            sx={{ minWidth: 140, fontWeight: 700 }}
                        >
                            {refreshing ? 'Refreshing...' : 'Refresh summary'}
                        </Button>
                        <Card
                            elevation={8}
                            sx={{
                                px: 3,
                                py: 2,
                                borderRadius: 3,
                                background: 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.16)',
                                minWidth: 240,
                            }}
                        >
                            <Typography sx={{ color: '#ffffff', fontWeight: 700, mb: 0.75 }}>
                                Dashboard status
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)', fontSize: 14 }}>
                                All metrics are loaded in real time from your inventory and AI predictions.
                            </Typography>
                        </Card>
                    </Box>
                </Box>

                <Box
                    sx={{
                        background: 'rgba(255,255,255,0.08)',
                        borderRadius: 4,
                        p: 4,
                        border: '1px solid rgba(255,255,255,0.18)',
                        boxShadow: '0 40px 90px rgba(0,0,0,0.18)',
                    }}
                >
                    <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 3 }}>
                        Inventory Summary
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid xs={12} md={3}>
                            <Card
                                elevation={6}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    minHeight: 150,
                                }}
                            >
                                <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                        <Inventory2Icon sx={{ mr: 1, fontSize: 16 }} /> Total Products
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                        {reportData.inventory_summary.total_products}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid xs={12} md={3}>
                            <Card
                                elevation={6}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    minHeight: 150,
                                }}
                            >
                                <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                        <Inventory2Icon sx={{ mr: 1, fontSize: 16 }} /> Available Stock
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                        {reportData.inventory_summary.available_stock}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid xs={12} md={3}>
                            <Card
                                elevation={6}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    minHeight: 150,
                                }}
                            >
                                <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                        <WarningAmberIcon sx={{ mr: 1, fontSize: 16 }} /> Low Stock
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                        {reportData.inventory_summary.low_stock}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                        <Grid xs={12} md={3}>
                            <Card
                                elevation={6}
                                sx={{
                                    borderRadius: 3,
                                    background: 'rgba(255,255,255,0.14)',
                                    border: '1px solid rgba(255,255,255,0.18)',
                                    minHeight: 150,
                                }}
                            >
                                <CardContent>
                                    <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                        <InventoryIcon sx={{ mr: 1, fontSize: 16 }} /> Out of Stock
                                    </Typography>
                                    <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                        {reportData.inventory_summary.out_of_stock}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    </Grid>

                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 3 }}>
                            Sales Summary
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid xs={12} md={4}>
                                <Card
                                    elevation={12}
                                    sx={{
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(59,130,246,0.24), rgba(37,99,235,0.16))',
                                        border: '1px solid rgba(255,255,255,0.2)',
                                        minHeight: 190,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <CardContent sx={{ px: 4, py: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                            <Typography variant="subtitle2" sx={{ color: '#c7d2ff', fontWeight: 700 }}>
                                                <MonetizationOnIcon sx={{ mr: 1, fontSize: 18 }} /> Today's Sales
                                            </Typography>
                                            <Box sx={{ px: 2, py: 0.5, borderRadius: 999, bgcolor: 'rgba(255,255,255,0.14)', color: '#dbeafe', fontWeight: 700, fontSize: 12 }}>
                                                LIVE
                                            </Box>
                                        </Box>
                                        <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                                            {reportData.sales_summary.today_sales}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 2, maxWidth: 320 }}>
                                            Updated from the latest order batch — a strong signal for today’s customer demand.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <ShoppingCartIcon sx={{ mr: 1, fontSize: 18 }} /> Products Sold
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.sales_summary.products_sold_today}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} md={4}>
                                <Card
                                    elevation={10}
                                    sx={{
                                        borderRadius: 4,
                                        background: 'linear-gradient(135deg, rgba(16,185,129,0.16), rgba(6,182,212,0.12))',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 190,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'space-between',
                                    }}
                                >
                                    <CardContent sx={{ px: 4, py: 3 }}>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 2, fontWeight: 700 }}>
                                            <TrendingUpIcon sx={{ mr: 1, fontSize: 18 }} /> Average Daily Sales
                                        </Typography>
                                        <Typography variant="h2" sx={{ color: '#ffffff', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.05 }}>
                                            {reportData.sales_summary.average_daily_sales}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.72)', mt: 2, maxWidth: 320 }}>
                                            The current moving average across recent sales periods for smarter restocking.
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>

                    <Box sx={{ mt: 5 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: '#ffffff', mb: 3 }}>
                            AI Prediction Summary
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid xs={12} sm={6} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <SmartToyIcon sx={{ mr: 1, fontSize: 18 }} /> Predictions
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.ai_summary.predictions_generated}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                        <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <ErrorOutlineOutlinedIcon sx={{ mr: 1, fontSize: 18 }} /> High Risk
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.ai_summary.high_risk}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                            <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <ReportProblemIcon sx={{ mr: 1, fontSize: 18 }} /> Medium Risk
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.ai_summary.medium_risk}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                            <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <CheckCircleIcon sx={{ mr: 1, fontSize: 18 }} /> Low Risk
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.ai_summary.low_risk}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid xs={12} sm={6} md={4}>
                                <Card
                                    elevation={6}
                                    sx={{
                                        borderRadius: 3,
                                        background: 'rgba(255,255,255,0.14)',
                                        border: '1px solid rgba(255,255,255,0.18)',
                                        minHeight: 150,
                                    }}
                                >
                                    <CardContent>
                                            <Typography variant="subtitle2" sx={{ color: '#c7d2ff', mb: 1, fontWeight: 700 }}>
                                            <HourglassEmptyIcon sx={{ mr: 1, fontSize: 18 }} /> Avg Stockout
                                        </Typography>
                                        <Typography variant="h3" sx={{ color: '#ffffff', fontWeight: 900 }}>
                                            {reportData.ai_summary.average_stockout_days}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>
                    </Box>
                </Box>
            </div>
        </div>
    );
}

export default Reports;

