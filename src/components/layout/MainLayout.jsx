import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Shield, BookOpen, FileText, Settings, LogOut, Users, Skull, Loader } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './MainLayout.css';

const ROLE_MAP = {
    '1412882240991658177': 'Owner',
    '1449856794980516032': 'Co-Owner',
    '1412882245735420006': 'Junta Directiva',
    '1412882248411381872': 'Administrador',
    '1412887079612059660': 'Staff',
    '1412887167654690908': 'Staff en Entrenamiento'
};

const GUILD_ID = '1398525215134318713';

const MainLayout = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState({
        username: 'Cargando...',
        role: 'Verificando...',
        avatar: null
    });

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) return;

            const providerToken = session.provider_token;
            try {
                // Fetch basic user data from Supabase
                const { user } = session;
                let username = user.user_metadata.full_name || user.user_metadata.name || 'Usuario';
                let avatar = user.user_metadata.avatar_url;
                let roleLabel = 'Miembro';

                if (providerToken) {
                    // Try to fetch specific Guild Member data for accurate Role & Nickname
                    const response = await fetch(`https://discord.com/api/users/@me/guilds/${GUILD_ID}/member`, {
                        headers: { Authorization: `Bearer ${providerToken}` }
                    });

                    if (response.ok) {
                        const memberData = await response.json();
                        if (memberData.nick) username = memberData.nick; // Use server nickname if present
                        if (memberData.user.avatar) {
                            // Construct dynamic avatar URL
                            avatar = `https://cdn.discordapp.com/avatars/${memberData.user.id}/${memberData.user.avatar}.png`;
                        }

                        // Determine highest priority role
                        const myRoles = memberData.roles;
                        // Check in order of priority (defined by the order in map keys if we iterated, but let's check array)
                        // Simple priority check:
                        if (myRoles.includes('1412882240991658177')) roleLabel = 'Owner';
                        else if (myRoles.includes('1449856794980516032')) roleLabel = 'Co-Owner';
                        else if (myRoles.includes('1412882245735420006')) roleLabel = 'Junta Directiva';
                        else if (myRoles.includes('1412882248411381872')) roleLabel = 'Administrador';
                        else if (myRoles.includes('1412887079612059660')) roleLabel = 'Staff';
                        else if (myRoles.includes('1412887167654690908')) roleLabel = 'Staff Ent.';
                    } else {
                        console.error("Failed to fetch Discord Member data:", response.status, response.statusText);
                    }
                }

                setProfile({ username, role: roleLabel, avatar });
            } catch (error) {
                console.error("Error fetching profile:", error);
            }
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="layout-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <Shield size={32} color="var(--primary)" />
                    <span className="sidebar-title">NACIÓN MX</span>
                </div>

                <nav className="nav-links">
                    <NavLink to="/dashboard" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Registros</span>
                    </NavLink>
                    <NavLink to="/dashboard/staff" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>Staff Hub</span>
                    </NavLink>
                    <NavLink to="/dashboard/bolo" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Skull size={20} />
                        <span>BOLO Board</span>
                    </NavLink>
                    <NavLink to="/dashboard/applications" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <FileText size={20} />
                        <span>Solicitudes</span>
                    </NavLink>
                    <NavLink to="/dashboard/rules" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <BookOpen size={20} />
                        <span>Reglamento</span>
                    </NavLink>
                    <NavLink to="/dashboard/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
                        <Settings size={20} />
                        <span>Admin</span>
                    </NavLink>
                </nav>

                <div className="user-profile">
                    {profile.avatar ? (
                        <img src={profile.avatar} alt="Profile" className="user-avatar" />
                    ) : (
                        <div className="user-avatar-placeholder">
                            {profile.username.charAt(0)}
                        </div>
                    )}
                    <div className="user-info">
                        <h4>{profile.username}</h4>
                        <span className="user-role-badge">{profile.role}</span>
                    </div>
                    <button onClick={handleLogout} className="nav-item logout-btn" title="Cerrar Sesión">
                        <LogOut size={18} />
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <Outlet />
            </main>

            <style>{`
                .user-role-badge {
                    font-size: 0.75rem;
                    color: var(--primary);
                    text-transform: uppercase;
                    font-weight: 700;
                    letter-spacing: 0.5px;
                }
                .user-avatar-placeholder {
                    width: 40px;
                    height: 40px;
                    background: var(--bg-card-hover);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    color: var(--text-muted);
                }
                .logout-btn {
                    margin-left: auto;
                    padding: 0.5rem;
                    color: var(--error);
                }
                .logout-btn:hover {
                    background: rgba(231, 76, 60, 0.1);
                }
            `}</style>
        </div>
    );
};

export default MainLayout;
