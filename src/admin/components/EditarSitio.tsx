import { useEffect } from 'react';
import { Settings, Sparkles, ExternalLink } from 'lucide-react';
import { initAdminUI } from '../../cms/admin-ui';

export default function EditarSitio() {
    useEffect(() => {
        // En el admin, queremos asegurar que el editor esté disponible
        const existing = document.querySelector('.cms-container');
        if (!existing) {
            // initAdminUI(); 
        }

        return () => {
            // Cleanup: Cerrar el panel si está abierto al salir de la pestaña
            const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Cerrar Editor'));
            if (closeBtn) {
                (closeBtn as HTMLElement).click();
            }
        };
    }, []);

    const launchCMS = () => {
        // Inicializamos sin botón flotante si no existe
        if (!document.querySelector('.cms-panel')) {
            initAdminUI({ showFloatingButton: false });
        }

        // Abrimos el panel usando la función global expuesta
        if ((window as any).toggleCMSPanel) {
            (window as any).toggleCMSPanel(true);
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '32px' }}>
                <h1 style={{ fontSize: '28px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>Editor de Sitio Web</h1>
                <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>Modifica el contenido y diseño de la página pública de GYMBOREE.</p>
            </div>

            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '24px' }}>
                <div className="chart-card glass-panel" style={{ gridColumn: 'span 8', padding: '40px', display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: 'var(--brand-orange-light)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <Sparkles size={32} color="var(--brand-orange)" />
                    </div>
                    <h2 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>Editor Visual Premium</h2>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '32px', lineHeight: 1.6 }}>
                        Utiliza nuestra herramienta de edición en tiempo real para cambiar títulos, descripciones y las imágenes principales sin necesidad de programar.
                    </p>

                    <button
                        onClick={launchCMS}
                        className="btn-primary"
                        style={{
                            padding: '14px 32px',
                            fontSize: '16px',
                            borderRadius: '12px',
                            background: '#1d1d1f',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            alignSelf: 'flex-start',
                            boxShadow: '0 10px 25px rgba(0,0,0,0.15)'
                        }}
                    >
                        <Settings size={20} />
                        Abrir Panel de Edición
                    </button>
                </div>

                <div className="glass-panel" style={{ gridColumn: 'span 4', padding: '24px' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px' }}>Vista Previa</h3>
                    <div style={{
                        aspectRatio: '1',
                        background: 'rgba(0,0,0,0.03)',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px',
                        border: '1px dashed var(--surface-border)'
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🌐</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sitio Público</div>
                        </div>
                    </div>

                    <a
                        href="/"
                        target="_blank"
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            width: '100%',
                            padding: '12px',
                            borderRadius: '10px',
                            background: 'transparent',
                            border: '1px solid var(--surface-border)',
                            color: 'var(--text-primary)',
                            textDecoration: 'none',
                            fontWeight: 600,
                            fontSize: '14px'
                        }}
                    >
                        Ver Sitio en Vivo <ExternalLink size={14} />
                    </a>
                </div>
            </div>

            <div className="glass-panel" style={{ marginTop: '24px', padding: '20px', background: 'rgba(52, 199, 89, 0.05)', border: '1px solid rgba(52, 199, 89, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '14px', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></span>
                    El sistema de persistencia local está activo. Los cambios se guardan automáticamente.
                </p>
            </div>
        </div>
    );
}
