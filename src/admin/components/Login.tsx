import { useState } from 'react';
import { Target, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react';

interface LoginProps {
    onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (username.trim().toLowerCase() === 'cataa' && password.trim() === '1234') {
            setError('');
            onLoginSuccess();
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <div className="login-wrapper">
            {/* Background decoration */}
            <div className="login-bg-shape bg-shape-1"></div>
            <div className="login-bg-shape bg-shape-2"></div>

            <div className="login-container">
                <a href="/" className="back-link">
                    <ArrowLeft size={16} />
                    Volver al sitio principal
                </a>

                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <Target size={36} strokeWidth={2.5} />
                        </div>
                        <h2 className="login-title">Iniciar Sesión</h2>
                        <p className="login-subtitle">SING | Sistema de Información Gerencial</p>
                    </div>

                    <form onSubmit={handleLogin}>
                        {error && (
                            <div className="error-message">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">Usuario</label>
                            <div className="input-wrapper">
                                <User size={20} className="input-icon" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Ej. administrador"
                                    className="premium-input"
                                    autoFocus
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Contraseña</label>
                            <div className="input-wrapper">
                                <Lock size={20} className="input-icon" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Tu contraseña secreta"
                                    className="premium-input"
                                />
                            </div>
                        </div>

                        <button type="submit" className="login-btn-submit">
                            Ingresar al Sistema
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
