import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import WalkinsCRM from './components/WalkinsCRM';
import Alumnos from './components/Alumnos';
import Reservas from './components/Reservas';
import Pagos from './components/Pagos';
import Almacen from './components/Almacen';
import Configuracion from './components/Configuracion';
import EditarSitio from './components/EditarSitio';
import TelegramBot from './components/TelegramBot';
import { Home, Users, Calendar, CreditCard, Box, Settings, Target, Layout, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('gym_auth') === 'true';
    });

    const [activeTab, setActiveTab] = useState(() => {
        return localStorage.getItem('gym_active_tab') || 'dashboard';
    });

    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        localStorage.setItem('gym_auth', 'true');
    };

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        localStorage.setItem('gym_active_tab', tab);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        localStorage.removeItem('gym_auth');
        localStorage.removeItem('gym_active_tab');
    };
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
        return localStorage.getItem('gym_sidebar_open') !== 'false';
    });

    const toggleSidebar = () => {
        const newState = !isSidebarOpen;
        setIsSidebarOpen(newState);
        localStorage.setItem('gym_sidebar_open', String(newState));
        console.log('Sidebar toggled:', newState);
    };

    if (!isAuthenticated) {
        return <Login onLoginSuccess={handleLoginSuccess} />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'walkins': return <WalkinsCRM />;
            case 'alumnos': return <Alumnos />;
            case 'reservas': return <Reservas />;
            case 'pagos': return <Pagos />;
            case 'almacen': return <Almacen />;
            case 'configuracion': return <Configuracion onLogout={handleLogout} />;
            case 'editar-sitio': return <EditarSitio />;
            case 'telegram-bot': return <TelegramBot />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className={`app-container glass-panel ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`} style={{
            borderRadius: 0,
            border: 'none',
            position: 'relative',
            width: '100%',
            height: '100vh',
            display: 'flex',
            overflow: 'hidden',
            background: 'var(--bg-gradient)'
        }}>
            <Sidebar activeTab={activeTab} setActiveTab={handleTabChange} isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}

function Sidebar({ activeTab, setActiveTab, isSidebarOpen, toggleSidebar }: {
    activeTab: string,
    setActiveTab: (tab: string) => void,
    isSidebarOpen: boolean,
    toggleSidebar: () => void
}) {
    return (
        <aside className={`sidebar glass-panel ${!isSidebarOpen ? 'collapsed' : ''}`} style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
            <div className="sidebar-header">
                <div className="brand-title" onClick={toggleSidebar}>
                    <Target size={28} color="var(--brand-orange)" />
                    {isSidebarOpen && <span>GYMBOREE<span>.</span></span>}
                </div>
                <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
                    {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </button>
            </div>

            <div style={{ marginTop: 20 }}>
                <div className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')} title={!isSidebarOpen ? 'Dashboard' : ''}>
                    <Home size={20} />
                    {isSidebarOpen && <span>Dashboard</span>}
                </div>
                <div className={`nav-item ${activeTab === 'walkins' ? 'active' : ''}`} onClick={() => setActiveTab('walkins')} title={!isSidebarOpen ? 'Walkins & CRM' : ''}>
                    <Target size={20} />
                    {isSidebarOpen && <span>Walkins & CRM</span>}
                </div>
                <div className={`nav-item ${activeTab === 'alumnos' ? 'active' : ''}`} onClick={() => setActiveTab('alumnos')} title={!isSidebarOpen ? 'Alumnos' : ''}>
                    <Users size={20} />
                    {isSidebarOpen && <span>Alumnos</span>}
                </div>
                <div className={`nav-item ${activeTab === 'reservas' ? 'active' : ''}`} onClick={() => setActiveTab('reservas')} title={!isSidebarOpen ? 'Reservas & Fiestas' : ''}>
                    <Calendar size={20} />
                    {isSidebarOpen && <span>Reservas & Fiestas</span>}
                </div>
                <div className={`nav-item ${activeTab === 'pagos' ? 'active' : ''}`} onClick={() => setActiveTab('pagos')} title={!isSidebarOpen ? 'Pagos & Facturación' : ''}>
                    <CreditCard size={20} />
                    {isSidebarOpen && <span>Pagos & Facturación</span>}
                </div>
                <div className={`nav-item ${activeTab === 'almacen' ? 'active' : ''}`} onClick={() => setActiveTab('almacen')} title={!isSidebarOpen ? 'Almacén' : ''}>
                    <Box size={20} />
                    {isSidebarOpen && <span>Almacén</span>}
                </div>
                <div className={`nav-item ${activeTab === 'editar-sitio' ? 'active' : ''}`} onClick={() => setActiveTab('editar-sitio')} title={!isSidebarOpen ? 'Editar Sitio' : ''}>
                    <Layout size={20} />
                    {isSidebarOpen && <span>Editar Sitio</span>}
                </div>
                <div className={`nav-item ${activeTab === 'telegram-bot' ? 'active' : ''}`} onClick={() => setActiveTab('telegram-bot')} title={!isSidebarOpen ? 'Telegram Bot' : ''}>
                    <MessageSquare size={20} />
                    {isSidebarOpen && <span>Telegram Bot</span>}
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div className={`nav-item ${activeTab === 'configuracion' ? 'active' : ''}`} onClick={() => setActiveTab('configuracion')} title={!isSidebarOpen ? 'Configuración' : ''}>
                    <Settings size={20} />
                    {isSidebarOpen && <span>Configuración</span>}
                </div>
            </div>
        </aside>
    );
}
