import Sidebar from "../../../components/Sidebar";
import StatCard from "../../../components/StatCard";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";

import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { getDashboardData } from "../../../services/dashboardService";
import { getProducts } from "../../../services/productServices";
import { getSalesHistory } from "../../../services/salesservice";

function Dashboard(){

const navigate=useNavigate();
const [dashboard, setDashboard] = useState({
    total_products: 0,
    low_stock: 0,
    today_sales: 0,
    ai_alerts: 0
});

const [productsList, setProductsList] = useState([]);
const [salesHistory, setSalesHistory] = useState([]);
const [topProducts, setTopProducts] = useState([]);

useEffect(() => {
    loadDashboard();
}, []);

useEffect(() => {
    loadExtras();
}, []);

const loadDashboard = async () => {
    const res = await getDashboardData();
    setDashboard(res.data);
};

const loadExtras = async () => {
    try {
        const [pRes, sRes] = await Promise.all([getProducts(), getSalesHistory()]);
        const productsData = pRes.data;
        const salesData = sRes.data;
        // compute top products by units_sold
        const counts = {};
        for (const sale of salesData) {
            const name = sale.product_name || 'Unknown';
            const units = Number(sale.units_sold) || 0;
            counts[name] = (counts[name] || 0) + units;
        }
        const arr = Object.keys(counts).map(name => ({ name, units: counts[name] }));
        arr.sort((a,b) => b.units - a.units);
        setTopProducts(arr.slice(0,6));

        setProductsList(productsData);
        setSalesHistory(salesData);
    } catch (err) {
        console.error('Error loading extras', err);
    }
};

return(

<div style={{display:"flex"}}>


<Sidebar/>


<div
    style={{
        flex:1,
        padding:40,
        background: "#f5f7fb",
        minHeight:"100vh",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    }}
>
    <div style={{maxWidth:1100, margin:'0 auto', paddingLeft:12, paddingRight:12}}>
        <div style={{textAlign:'center', marginBottom: 6}}>
            <h1 style={{margin:0, fontSize:28}}>🧠 Smart Inventory Intelligence</h1>
            <p style={{marginTop:8, color:'#334155'}}>AI Powered Inventory Management System</p>
        </div>

        <div style={{display:"flex", gap:20, marginTop:18, flexWrap:"wrap", justifyContent:'center', alignItems:'center'}}>

<StatCard
 title="Products"
 value={dashboard.total_products}
color="#2563eb"
/>

<StatCard
 title="Low Stock"
value={dashboard.low_stock}
color="#ef4444"
/>

<StatCard
title="Today's Sales"
value={dashboard.today_sales}
color="#16a34a"
/>

<StatCard
title="AI Alerts"
value={dashboard.ai_alerts}
color="#9333ea"
/>

        </div>

        

        {/* Additional content: Top Products and Alerts/Tips */}
        <div style={{display:'flex', gap:32, marginTop:36, alignItems:'stretch', justifyContent:'space-between', flexWrap:'wrap'}}>
            <div style={{flex: '1 1 52%', minWidth:300, maxWidth:450, display:'flex'}}>
                <Paper elevation={3} sx={{p:2, borderRadius:2, width:'100%', display:'flex', flexDirection:'column'}}>
                    <h3 style={{marginTop:0}}>Top Products (by units sold)</h3>
                    <List>
                        {topProducts.length === 0 ? (
                            <ListItem><ListItemText primary="No sales data" /></ListItem>
                        ) : (
                            topProducts.map((p, idx) => {
                                const max = topProducts[0]?.units || 1;
                                const pct = Math.round((p.units / max) * 100);
                                return (
                                    <ListItem key={p.name} sx={{display:'block', px:0, py:1, borderBottom:'1px solid rgba(15,23,42,0.04)'}}>
                                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                            <div style={{display:'flex', gap:8, alignItems:'center'}}>
                                                <strong style={{minWidth:32}}>{idx+1}.</strong>
                                                <span style={{fontWeight:600}}>{p.name}</span>
                                            </div>
                                            <span style={{fontWeight:700}}>{p.units}</span>
                                        </div>
                                        <div style={{height:8, background:'#eef2ff', borderRadius:6, marginTop:8}}>
                                            <div style={{height:8, width:`${pct}%`, background:'#2563eb', borderRadius:6}} />
                                        </div>
                                    </ListItem>
                                )
                            })
                        )}
                    </List>
                </Paper>
            </div>

            <div style={{flex: '1 1 400px', minWidth:340, maxWidth:580, display:'flex'}}>
                <Paper elevation={3} sx={{p:2, borderRadius:2, width:'100%', display:'flex', flexDirection:'column', justifyContent:'space-between'}}>
                    <h3 style={{marginTop:0}}>Alerts & Tips</h3>
                    <div style={{marginBottom:12}}>
                        <strong>Low stock items</strong>
                        <List>
                            {productsList.filter(p=>p.quantity <= 10).length === 0 ? (
                                <ListItem><ListItemText primary="No low stock items" /></ListItem>
                            ) : (
                                productsList.filter(p=>p.quantity <= 10).slice(0,6).map(prod => (
                                    <ListItem key={prod.id} secondaryAction={<Chip label={`Qty ${prod.quantity}`} color={prod.quantity<=3? 'error':'warning'} /> }>
                                        <ListItemText primary={prod.name} />
                                    </ListItem>
                                ))
                            )}
                        </List>
                    </div>
                    <div style={{marginTop:8}}>
                        <strong>Tips</strong>
                        <ul style={{marginTop:8}}>
                            <li>Record sales immediately to keep inventory accurate.</li>
                            <li>Reorder items when quantity &le; 10 to avoid stockouts.</li>
                            <li>Use AI Prediction to anticipate demand spikes.</li>
                        </ul>
                    </div>
                </Paper>
            </div>
        </div>

        {/* Quick Actions (moved to bottom) */}
        <div style={{marginTop:30, display:'flex', justifyContent:'center'}}>
            <div>
                <h2 style={{marginBottom:12, textAlign:'center'}}>Quick Actions</h2>
                <div style={{display:'flex', gap:16, justifyContent:'center'}}>
                    <Button variant="contained" onClick={()=>navigate('/admin/daily-sales')} sx={{background:'#2563eb'}}>Daily Sales</Button>
                    <Button variant="contained" onClick={()=>navigate('/admin/ai-predictions')} sx={{background:'#7c3aed'}}>AI Prediction</Button>
                    <Button variant="outlined" onClick={()=>navigate('/admin/reports')}>Reports</Button>
                </div>
            </div>
        </div>

    </div>

</div>
</div>

);

}


export default Dashboard;