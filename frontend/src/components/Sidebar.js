import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from '@mui/icons-material/Dashboard';
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AssessmentIcon from '@mui/icons-material/Assessment';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';

import "./Sidebar.css";

function Sidebar() {

    const location = useLocation();
    const navigate = useNavigate();
    const { isAuthenticated, logout } = useAuth();

    return (

        <div className="sidebar">

            <h2>Smart Inventory</h2>

            <Link
                className={location.pathname==="/admin"?"active":""}
                to="/admin"
            >
                <DashboardIcon sx={{ mr: 1, fontSize: 18 }} /> Dashboard
            </Link>

            <Link
                className={location.pathname==="/admin/daily-sales"?"active":""}
                to="/admin/daily-sales"
            >
                <PointOfSaleIcon sx={{ mr: 1, fontSize: 18 }} /> Daily Sales
            </Link>

            <Link
                className={location.pathname==="/admin/ai-predictions"?"active":""}
                to="/admin/ai-predictions"
            >
                <SmartToyIcon sx={{ mr: 1, fontSize: 18 }} /> AI Prediction
            </Link>

            <Link
                className={location.pathname==="/admin/reports"?"active":""}
                to="/admin/reports"
            >
                <AssessmentIcon sx={{ mr: 1, fontSize: 18 }} /> Reports
            </Link>

            {isAuthenticated && (
                <div style={{ marginTop: 12 }}>
                    <button
                        type="button"
                        style={{ background: 'transparent', border: 'none', color: '#fff', cursor: 'pointer', padding: 0 }}
                        onClick={() => { logout(); navigate('/'); }}
                    >
                        <LogoutIcon sx={{ mr: 1, fontSize: 16 }} /> Logout
                    </button>
                </div>
            )}

        </div>

    );

}

export default Sidebar;