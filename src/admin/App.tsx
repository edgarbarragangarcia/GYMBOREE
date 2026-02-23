import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import WalkinsCRM from './components/WalkinsCRM';
import Alumnos from './components/Alumnos';
import Reservas from './components/Reservas';
import Pagos from './components/Pagos';
import Almacen from './components/Almacen';
import Configuracion from './components/Configuracion';
import { Home, Users, Calendar, CreditCard, Box, Settings, Target } from 'lucide-react';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    if (!isAuthenticated) {
        return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'walkins': return <WalkinsCRM />;
            case 'alumnos': return <Alumnos />;
            case 'reservas': return <Reservas />;
            case 'pagos': return <Pagos />;
            case 'almacen': return <Almacen />;
            case 'configuracion': return <Configuracion />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="login-wrapper" style={{ minHeight: '100vh', width: '100vw', background: 'var(--bg-gradient)' }}>
            {/* Global Animated Background Shapes */}
            <div className="login-bg-shape bg-shape-1"></div>
            <div className="login-bg-shape bg-shape-2"></div>

            <div className="app-container glass-panel" style={{ borderRadius: 0, border: 'none', position: 'relative', zIndex: 10, width: '100%', height: '100vh', display: 'flex' }}>
                <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
                <main className="main-content">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
    return (
        <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
            <div className="brand-title">
                <Target size={28} color="var(--brand-orange)" />
                GYMBOREE<span>.</span>
            </div>

            <div style={{ marginTop: 20 }}>
                <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
                    <Home size={20} />
                    <span>Dashboard</span>
                </div>
                <div className={`nav-item ${activeTab === 'walkins' ? 'active' : ''}`} onClick={() => setActiveTab('walkins')}>
                    <Target size={20} />
                    <span>Walkins & CRM</span>
                </div>
                <div className={`nav-item ${activeTab === 'alumnos' ? 'active' : ''}`} onClick={() => setActiveTab('alumnos')}>
                    <Users size={20} />
                    <span>Alumnos</span>
                </div>
                <div className={`nav-item ${activeTab === 'reservas' ? 'active' : ''}`} onClick={() => setActiveTab('reservas')}>
                    <Calendar size={20} />
                    <span>Reservas & Fiestas</span>
                </div>
                <div className={`nav-item ${activeTab === 'pagos' ? 'active' : ''}`} onClick={() => setActiveTab('pagos')}>
                    <CreditCard size={20} />
                    <span>Pagos & Facturación</span>
                </div>
                <div className={`nav-item ${activeTab === 'almacen' ? 'active' : ''}`} onClick={() => setActiveTab('almacen')}>
                    <Box size={20} />
                    <span>Almacén</span>
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div className={`nav-item ${activeTab === 'configuracion' ? 'active' : ''}`} onClick={() => setActiveTab('configuracion')}>
                    <Settings size={20} />
                    <span>Configuración</span>
                </div>
            </div>
        </aside>
    );
}
