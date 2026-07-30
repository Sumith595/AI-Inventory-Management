import React,{useEffect,useState} from "react";
import Sidebar from "../../../components/Sidebar";
import {getPredictions, generatePredictions} from "../../../services/predictionService";
import {
Grid,
Card,
CardContent,
Typography,
Chip,
Box,
Button,
TextField,
MenuItem,
Divider
} from "@mui/material";

import SmartToyIcon from '@mui/icons-material/SmartToy';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';


function AIPrediction(){

const [predictions,setPredictions]=useState([]);

const[loading,setLoading]=useState(false);

const[searchTerm,setSearchTerm]=useState("");
const[appliedSearch,setAppliedSearch]=useState("");
const[riskFilter,setRiskFilter]=useState("All");
const[appliedRisk,setAppliedRisk]=useState("All");
const[searchSubmitted,setSearchSubmitted]=useState(false);


useEffect(()=>{

loadPredictions();

},[]);

const loadPredictions = async () => {

    try {

        const response = await getPredictions();

        setPredictions(response.data);

    } catch (error) {

        console.log(error);

    }

};

const handleGeneratePrediction = async () => {

    try {

        setLoading(true);

        const response = await generatePredictions();

        if (!response.data?.success) {
            throw new Error(response.data?.message || "Prediction generation failed");
        }

        await loadPredictions();

        alert("AI Predictions Generated Successfully!");

    } catch (error) {

        console.log(error);

        alert(`Failed to generate predictions: ${error.message || error}`);

    } finally {

        setLoading(false);

    }

};

const filteredPredictions = predictions.filter((prediction) => {
    const searchValue = appliedSearch.trim().toLowerCase();
    const predictionName = String(prediction.product_name || "").trim().toLowerCase();
    const predictionRisk = String(prediction.risk_level || "").trim().toLowerCase();
    const riskValue = String(appliedRisk || "").trim().toLowerCase();

    const matchesSearch =
        searchValue.length === 0 || predictionName.includes(searchValue);

    const matchesRisk =
        appliedRisk === "All" || predictionRisk === riskValue;

    return matchesSearch && matchesRisk;
});

const handleSearchSubmit = () => {
    setAppliedSearch(searchTerm.trim());
    setAppliedRisk(riskFilter);
    setSearchSubmitted(true);
};

const handleClearFilters = () => {
    setSearchTerm("");
    setAppliedSearch("");
    setRiskFilter("All");
    setAppliedRisk("All");
    setSearchSubmitted(false);
};

const showResults = searchSubmitted;
const visiblePredictions = showResults ? filteredPredictions : [];
const summaryPredictions = showResults ? filteredPredictions : predictions;

const totalProducts = summaryPredictions.length;

const highRisk = summaryPredictions.filter(
    p => String(p.risk_level || "").trim().toLowerCase() === "high"
).length;

const avgStockout = summaryPredictions.length > 0
    ? (
        summaryPredictions.reduce(
            (sum, p) =>
                sum + (p.predicted_stockout_days || 0),
            0
        ) / summaryPredictions.length
      ).toFixed(1)
    : 0;

const avgGrowth = summaryPredictions.length > 0
    ? (
        summaryPredictions.reduce(
            (sum, p) =>
                sum + (p.demand_growth || 0),
            0
        ) / summaryPredictions.length
      ).toFixed(1)
    : 0;




return(

<div style={{display: "flex", minHeight: "100vh", background: "radial-gradient(circle at top left, rgba(139, 92, 246, 0.24), transparent 28%), radial-gradient(circle at 85% 15%, rgba(96, 165, 250, 0.18), transparent 18%), linear-gradient(145deg, #120d38 0%, #432b8d 42%, #6c4be5 100%)", overflow: 'hidden'}}>

<Sidebar/>

<div style={{flex: 1, padding: "36px 40px", color: "#f9f9ff"}}>
    <Box
        sx={{
            maxWidth: "1100px",
            margin: "0 auto",
            background: "rgba(255, 255, 255, 0.08)",
            borderRadius: "24px",
            padding: "28px",
            boxShadow: "0 36px 100px rgba(0,0,0,0.32)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(16px)",
        }}
    >
        <Box
            sx={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 2,
                mb: 4,
            }}
        >
            <Box>
                <Typography variant="h3" sx={{ fontWeight: 800, mb: 1 }}>
                    AI Inventory Prediction
                </Typography>
                <Typography sx={{ color: "rgba(255,255,255,0.72)", fontSize: 16 }}>
                    Smart stock forecasting and risk analysis for your products.
                </Typography>
            </Box>

            <Button
                variant="contained"
                color="secondary"
                onClick={handleGeneratePrediction}
                disabled={loading}
                sx={{
                    minWidth: 170,
                    py: 1.5,
                    fontWeight: 700,
                    boxShadow: "0 12px 30px rgba(0,0,0,0.18)",
                }}
            >
                {loading ? "Generating..." : <><SmartToyIcon sx={{ mr: 1, fontSize: 18 }} /> Generate AI Prediction</>}
            </Button>
        </Box>

    <Box sx={{ mb: 3 }}>
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '2.2fr 1fr' },
                gap: 2,
                p: 3,
                borderRadius: 4,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05)',
            }}
        >
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' },
                    gap: 2,
                    alignItems: 'center',
                }}
            >
                <TextField
                    variant="outlined"
                    label="Search product"
                    size="small"
                    fullWidth
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSearchSubmit();
                        }
                    }}
                    placeholder="Type product name"
                    sx={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.28)' },
                            '&.Mui-focused fieldset': { borderColor: '#c084fc' },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#e8e8ff',
                        },
                    }}
                />

                <TextField
                    select
                    variant="outlined"
                    size="small"
                    label="Risk"
                    fullWidth
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    sx={{
                        backgroundColor: 'rgba(255,255,255,0.12)',
                        borderRadius: 2,
                        '& .MuiOutlinedInput-root': {
                            color: '#ffffff',
                            '& fieldset': { borderColor: 'rgba(255,255,255,0.18)' },
                            '&:hover fieldset': { borderColor: 'rgba(255,255,255,0.28)' },
                            '&.Mui-focused fieldset': { borderColor: '#c084fc' },
                        },
                        '& .MuiInputLabel-root': {
                            color: '#e8e8ff',
                        },
                    }}
                >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="Low">Low</MenuItem>
                </TextField>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: { xs: 'flex-start', sm: 'flex-end' } }}>
                    <Button
                        variant="contained"
                        color="secondary"
                        onClick={handleSearchSubmit}
                        sx={{ minWidth: 120, py: 1.2, fontWeight: 700, background: 'linear-gradient(135deg, #9d4edd 0%, #d946ef 100%)' }}
                    >
                        Search
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleClearFilters}
                        sx={{ minWidth: 120, py: 1.2, color: '#ffffff', borderColor: 'rgba(255,255,255,0.24)' }}
                    >
                        Clear
                    </Button>
                </Box>
            </Box>

            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: { xs: 'flex-start', lg: 'flex-end' },
                    gap: 2,
                    px: { xs: 0, lg: 2 },
                }}
            >
                <Card
                    elevation={3}
                    sx={{
                        width: '100%',
                        maxWidth: 320,
                        borderRadius: 3,
                        background: 'linear-gradient(180deg, rgba(255,255,255,0.16), rgba(255,255,255,0.08))',
                        border: '1px solid rgba(255,255,255,0.18)',
                        boxShadow: '0 18px 40px rgba(0,0,0,0.12)',
                    }}
                >
                    <CardContent>
                        <Typography sx={{ color: '#ffffff', fontWeight: 800, fontSize: 15, mb: 0.5 }}>
                            {showResults ? `Showing ${totalProducts} results` : 'Search to load predictions'}
                        </Typography>
                        <Typography sx={{ color: 'rgba(255,255,255,0.68)', fontSize: 13, mb: 1 }}>
                            {showResults ? `Active filter: ${appliedRisk}` : 'Search or choose a risk filter to begin'}
                        </Typography>
                        <Typography sx={{ color: '#c4b5fd', fontSize: 12 }}>
                            Use the search box and risk selector to narrow down the most urgent predictions.
                        </Typography>
                    </CardContent>
                </Card>

                <Box
                    sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 3,
                        border: '1px solid rgba(255,255,255,0.18)',
                        background: 'rgba(255,255,255,0.08)',
                    }}
                >
                    <Typography sx={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>
                        Demand Growth: {avgGrowth}%
                    </Typography>
                </Box>
            </Box>
        </Box>
    </Box>

    <Grid container spacing={3} sx={{ mb: 3 }}>
                {[
                {
                label: 'Total products',
                value: totalProducts,
                icon: <Inventory2Icon sx={{ mr: 1, fontSize: 18 }} />,
                color: '#ffd166',
                subtitle: 'Active items',
                accent: 'rgba(255, 209, 102, 0.18)',
            },
            {
                label: 'Critical risk',
                value: summaryPredictions.filter(
                    p => String(p.risk_level || "").trim().toLowerCase() === "high"
                ).length,
                icon: <ErrorOutlineOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />,
                color: '#ff6b6b',
                subtitle: 'Immediate attention',
                accent: 'rgba(255, 107, 107, 0.16)',
            },
            {
                label: 'High risk',
                value: highRisk,
                icon: <ErrorOutlineOutlinedIcon sx={{ mr: 1, fontSize: 18 }} />,
                color: '#ff6b6b',
                subtitle: 'Requires attention',
                accent: 'rgba(255, 107, 107, 0.16)',
            },
            {
                label: 'Avg stockout',
                value: `${avgStockout}d`,
                icon: <HourglassEmptyIcon sx={{ mr: 1, fontSize: 18 }} />,
                color: '#4db6ac',
                subtitle: 'Time to reorder',
                accent: 'rgba(77, 182, 172, 0.16)',
            },
                ].map((stat, index) => (
            <Grid xs={12} sm={6} md={4} key={stat.label}>
                <Card
                    elevation={6}
                    sx={{
                        position: 'relative',
                        borderRadius: 4,
                        minHeight: 150,
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.14)',
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -20,
                            right: -20,
                            width: 120,
                            height: 120,
                            borderRadius: '50%',
                            background: stat.accent,
                            filter: 'blur(12px)',
                            opacity: 0.85,
                        }}
                    />
                    <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                        <Typography sx={{ fontSize: 12, color: stat.color, fontWeight: 800, textTransform: 'uppercase', mb: 1 }}>
                            {stat.icon} {stat.label}
                        </Typography>
                        <Typography variant="h3" sx={{ fontWeight: 900, color: '#ffffff', lineHeight: 1.05 }}>
                            {stat.value}
                        </Typography>
                        <Typography sx={{ mt: 1.5, color: 'rgba(255,255,255,0.72)', fontSize: 13 }}>
                            {stat.subtitle}
                        </Typography>
                    </CardContent>
                </Card>
            </Grid>
        ))}
    </Grid>

    <Box sx={{ mb: 3, pt: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#ffffff', mb: 1 }}>
            Prediction results
        </Typography>
        <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
            Search a product by name or choose a risk level to display prediction details.
        </Typography>
    </Box>

    {showResults ? (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, minmax(320px, 1fr))',
                    lg: 'repeat(3, minmax(320px, 1fr))',
                },
                gap: 3,
                alignItems: 'stretch',
            }}
        >
            {visiblePredictions.length === 0 ? (
                <Box sx={{ gridColumn: '1 / -1' }}>
                    <Card
                        elevation={5}
                        sx={{
                            borderRadius: 4,
                            background: 'rgba(255,255,255,0.12)',
                            border: '1px solid rgba(255,255,255,0.18)',
                        }}
                    >
                        <CardContent>
                            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700 }}>
                                No predictions found
                            </Typography>
                            <Typography sx={{ color: 'rgba(255,255,255,0.72)' }}>
                                No items match that search. Try a different product name or risk level.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            ) : (
                visiblePredictions.map((prediction) => (
                    <Card
                        key={prediction.id ?? prediction.product_id}
                        elevation={7}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 4,
                            minHeight: 420,
                            background: 'rgba(255,255,255,0.12)',
                            color: '#f7f7fd',
                            backdropFilter: 'blur(24px)',
                            border: '1px solid rgba(255,255,255,0.14)',
                            transition: 'transform 0.22s ease, box-shadow 0.22s ease',
                            '&:hover': {
                                transform: 'translateY(-6px)',
                                boxShadow: '0 26px 70px rgba(0,0,0,0.25)',
                            },
                        }}
                    >
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', flex: 1, px: 3, pb: 3 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                                <Typography variant="h5" sx={{ fontWeight: 900, flex: 1, minWidth: 0 }}>
                                    {prediction.product_name}
                                </Typography>
                                <Chip
                                    label={prediction.risk_level}
                                    color={
                                        prediction.risk_level === 'Critical'
                                            ? 'error'
                                            :prediction.risk_level === 'High'
                                            ? 'warning'
                                            : prediction.risk_level === 'Medium'
                                            ? 'warning'
                                            : 'success'
                                    }
                                    sx={{ fontWeight: 700, ml: 1 }}
                                />
                            </Box>

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' }, gap: 2, mb: 2 }}>
                                <Box>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, mb: 0.5 }}>
                                        Stock
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>{prediction.current_stock}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, mb: 0.5 }}>
                                        Daily sales
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>{prediction.average_daily_sales}</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, mb: 0.5 }}>
                                        Stockout
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>{prediction.predicted_stockout_days ?? 'N/A'} Days</Typography>
                                </Box>
                                <Box>
                                    <Typography sx={{ color: 'rgba(255,255,255,0.82)', fontSize: 13, mb: 0.5 }}>
                                        Growth
                                    </Typography>
                                    <Typography sx={{ color: '#ffffff', fontWeight: 700 }}>{prediction.demand_growth}%</Typography>
                                </Box>
                            </Box>

                            <Divider sx={{ borderColor: 'rgba(255,255,255,0.14)', mb: 2 }} />

                            <Box sx={{ p: 2, borderRadius: 3, background: 'rgba(255,255,255,0.10)', mt: 'auto' }}>
                                <Typography sx={{ fontWeight: 700, mb: 1, color: '#ffffff' }}>
                                    Recommendation
                                </Typography>
                                <Typography sx={{ lineHeight: 1.75, color: 'rgba(255,255,255,0.78)' }}>
                                    {prediction.recommendation}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                ))
            )}
        </Box>
    ) : (
        <Card
            elevation={5}
            sx={{
                borderRadius: 4,
                background: 'rgba(255,255,255,0.10)',
                border: '1px solid rgba(255,255,255,0.18)',
                py: 6,
                px: 4,
                textAlign: 'center',
            }}
        >
            <Typography variant="h6" sx={{ color: '#ffffff', fontWeight: 700, mb: 1 }}>
                Search to see AI predictions
            </Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.72)', maxWidth: 590, margin: '0 auto' }}>
                Enter a product name or choose a risk level to reveal only the prediction details you need.
            </Typography>
        </Card>
    )}

    </Box>
</div>

</div>

)

}

export default AIPrediction;