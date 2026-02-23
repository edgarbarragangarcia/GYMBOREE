import { useState } from 'react';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { Home, Users, Calendar, CreditCard, Box, Settings, Target } from 'lucide-react';

export default function App() {
    // Estado de autenticación
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    if (!isAuthenticated) {
        return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="app-container glass-panel" style={{ borderRadius: 0, border: 'none' }}>
            <Sidebar />
            <main className="main-content">
                <Dashboard />
            </main>
        </div>
    );
}

function Sidebar() {
    return (
        <aside className="sidebar glass-panel" style={{ borderRadius: 0, borderTop: 'none', borderBottom: 'none', borderLeft: 'none' }}>
            <div className="brand-title">
                <Target size={28} color="var(--brand-orange)" />
                GYMBOREE<span>.</span>
            </div>

            <div style={{ marginTop: 20 }}>
                <div className="nav-item active">
                    <Home size={20} />
                    <span>Dashboard</span>
                </div>
                <div className="nav-item">
                    <Target size={20} />
                    <span>Walkins & CRM</span>
                </div>
                <div className="nav-item">
                    <Users size={20} />
                    <span>Alumnos</span>
                </div>
                <div className="nav-item">
                    <Calendar size={20} />
                    <span>Reservas & Fiestas</span>
                </div>
                <div className="nav-item">
                    <CreditCard size={20} />
                    <span>Pagos & Facturación</span>
                </div>
                <div className="nav-item">
                    <Box size={20} />
                    <span>Almacén</span>
                </div>
            </div>

            <div style={{ marginTop: 'auto' }}>
                <div className="nav-item">
                    <Settings size={20} />
                    <span>Configuración</span>
                </div>
            </div>
        </aside>
    );
}
