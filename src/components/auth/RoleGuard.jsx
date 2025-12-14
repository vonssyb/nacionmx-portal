import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, Loader } from 'lucide-react';

// CONFIGURATION
// TODO: Replace with your actual Server ID (Guild ID)
const GUILD_ID = '1398525215134318713';

// TODO: Replace with the actual Role IDs allowed to access
// You can get these by right-clicking a role in Discord > Copy ID (Developer Mode ON)
const ALLOWED_ROLE_IDS = [
    '1412882240991658177', // Owner
    '1449856794980516032', // Co Owner
    '1412882245735420006', // Junta Directiva
    '1412882248411381872', // Administrador
    '1412887079612059660', // Staff
    '1412887167654690908'  // Staff en entrenamiento
];

const RoleGuard = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        checkAccess();
    }, []);

    const checkAccess = async () => {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            navigate('/login');
            return;
        }

        const providerToken = session.provider_token;
        if (!providerToken) {
            // Logged in but no Discord token found (maybe old session or email login)
            console.warn("No provider token found. Re-login required.");
            await supabase.auth.signOut();
            navigate('/login');
            return;
        }

        try {
            // Fetch User's Guild Member Object
            const response = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                headers: {
                    Authorization: `Bearer ${providerToken}`
                }
            });

            if (response.status === 404) {
                // User is not in the server
                throw new Error("No eres miembro del servidor de Discord de Nación MX.");
            }

            if (!response.ok) {
                const errData = await response.json();
                console.error("Discord API Error:", errData);
                throw new Error("Error verificando roles en Discord.");
            }

            const memberData = await response.json();
            const userRoles = memberData.roles; // Array of role IDs

            // Check if user has at least one allowed role
            // If ALLOWED_ROLE_IDS contains generic placeholders, allow all for demo purposes but warn
            const isConfigured = !ALLOWED_ROLE_IDS[0].includes('REPLACE');

            if (!isConfigured) {
                console.warn("Role Guard not configured. allowing access for setup.");
                setAuthorized(true);
            } else {
                const hasRole = userRoles.some(roleId => ALLOWED_ROLE_IDS.includes(roleId));
                if (hasRole) {
                    setAuthorized(true);
                } else {
                    throw new Error("No tienes los roles necesarios para acceder a este panel.");
                }
            }

        } catch (err) {
            console.error(err);
            setError(err.message);
            setAuthorized(false);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div style={styles.center}>
                <Loader size={48} className="animate-spin" color="var(--primary)" />
                <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Verificando credenciales...</p>
                <style>{`
                    .animate-spin { animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.center}>
                <div style={styles.card}>
                    <ShieldAlert size={64} color="#e74c3c" />
                    <h1 style={styles.title}>Acceso Denegado</h1>
                    <p style={styles.message}>{error}</p>
                    <button onClick={() => { supabase.auth.signOut(); navigate('/login'); }} style={styles.button}>
                        Volver al Inicio
                    </button>
                    {error.includes('Discord') && (
                        <small style={{ display: 'block', marginTop: '1rem', color: '#666' }}>
                            Asegúrate de estar en el servidor correcto y tener el rol asignado.
                        </small>
                    )}
                </div>
            </div>
        );
    }

    return authorized ? children : null;
};

const styles = {
    center: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-dark)',
        color: 'var(--text-main)',
    },
    card: {
        background: 'var(--bg-card)',
        padding: '3rem',
        borderRadius: 'var(--radius)',
        border: '1px solid var(--border)',
        textAlign: 'center',
        maxWidth: '400px',
    },
    title: {
        margin: '1rem 0',
        fontSize: '1.5rem',
        color: '#e74c3c',
    },
    message: {
        color: 'var(--text-muted)',
        marginBottom: '2rem',
    },
    button: {
        background: 'var(--bg-card-hover)',
        color: 'var(--text-main)',
        border: '1px solid var(--border)',
        padding: '0.75rem 1.5rem',
        borderRadius: 'var(--radius)',
        cursor: 'pointer',
    }
};

export default RoleGuard;
