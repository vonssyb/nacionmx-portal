import React from 'react';
import { Shield, Star, Award, Clock } from 'lucide-react';

const StaffHub = () => {
    // Mock data
    const staffMembers = [
        { id: 1, name: 'Gonzalez', role: 'Owner', avatar: null, status: 'online', joined: '2023-01-01', actions: 1542 },
        { id: 2, name: 'AdminUser', role: 'Admin', avatar: null, status: 'idle', joined: '2023-05-12', actions: 890 },
        { id: 3, name: 'ModOne', role: 'Moderator', avatar: null, status: 'offline', joined: '2024-02-15', actions: 320 },
        { id: 4, name: 'ModTwo', role: 'Moderator', avatar: null, status: 'online', joined: '2024-03-01', actions: 150 },
        { id: 5, name: 'DevOne', role: 'Developer', avatar: null, status: 'dnd', joined: '2023-08-20', actions: 55 },
    ];

    const getRoleColor = (role) => {
        switch (role) {
            case 'Owner': return '#e74c3c'; // Red
            case 'Co-Owner': return '#d35400'; // Orange
            case 'Admin': return '#f1c40f'; // Yellow
            case 'Developer': return '#3498db'; // Blue
            case 'Moderator': return '#2ecc71'; // Green
            default: return '#95a5a6';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return '#2ecc71';
            case 'idle': return '#f1c40f';
            case 'dnd': return '#e74c3c';
            default: return '#7f8c8d';
        }
    };

    return (
        <div className="staff-hub-container">
            <div className="page-header">
                <h1 className="page-title">Directorio de Staff</h1>
                <p className="page-subtitle">Gestión y visualización del equipo de Nación MX.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(52, 152, 219, 0.2)', color: '#3498db' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Total Staff</h3>
                        <p>{staffMembers.length} Miembros</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(46, 204, 113, 0.2)', color: '#2ecc71' }}>
                        <Clock size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Activos Ahora</h3>
                        <p>{staffMembers.filter(m => m.status !== 'offline').length} En línea</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon" style={{ background: 'rgba(241, 196, 15, 0.2)', color: '#f1c40f' }}>
                        <Award size={24} />
                    </div>
                    <div className="stat-info">
                        <h3>Acciones Totales</h3>
                        <p>{staffMembers.reduce((acc, curr) => acc + curr.actions, 0)} Registradas</p>
                    </div>
                </div>
            </div>

            <div className="staff-grid">
                {staffMembers.map(member => (
                    <div key={member.id} className="staff-card card">
                        <div className="staff-header">
                            <div className="staff-avatar-container">
                                <div className="staff-avatar-placeholder">
                                    {member.name.charAt(0)}
                                </div>
                                <div
                                    className="status-indicator"
                                    style={{ background: getStatusColor(member.status) }}
                                    title={member.status}
                                />
                            </div>
                            <div className="staff-identity">
                                <h3>{member.name}</h3>
                                <span className="role-badge" style={{ borderColor: getRoleColor(member.role), color: getRoleColor(member.role) }}>
                                    {member.role}
                                </span>
                            </div>
                        </div>
                        <div className="staff-stats">
                            <div className="mini-stat">
                                <span className="label">Unido</span>
                                <span className="value">{member.joined}</span>
                            </div>
                            <div className="mini-stat">
                                <span className="label">Acciones</span>
                                <span className="value">{member.actions}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <style>{`
                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 1.5rem;
                    margin-bottom: 2rem;
                }
                .stat-card {
                    background: var(--bg-card);
                    padding: 1.5rem;
                    border-radius: var(--radius);
                    border: 1px solid var(--border);
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .stat-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .stat-info h3 {
                    font-size: 0.9rem;
                    color: var(--text-muted);
                    margin-bottom: 0.25rem;
                }
                .stat-info p {
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: var(--text-main);
                }
                .staff-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                    gap: 1.5rem;
                }
                .staff-card {
                    padding: 1.5rem;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                    transition: var(--transition);
                }
                .staff-card:hover {
                    transform: translateY(-5px);
                    border-color: var(--primary);
                }
                .staff-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                .staff-avatar-container {
                    position: relative;
                }
                .staff-avatar-placeholder {
                    width: 56px;
                    height: 56px;
                    background: var(--bg-card-hover);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-muted);
                    border: 2px solid var(--border);
                }
                .status-indicator {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    border: 2px solid var(--bg-card);
                }
                .staff-identity h3 {
                    font-size: 1.1rem;
                    margin-bottom: 0.25rem;
                }
                .role-badge {
                    font-size: 0.75rem;
                    border: 1px solid;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .staff-stats {
                    display: flex;
                    justify-content: space-between;
                    padding-top: 1rem;
                    border-top: 1px solid var(--border);
                }
                .mini-stat {
                    display: flex;
                    flex-direction: column;
                }
                .mini-stat .label {
                    font-size: 0.75rem;
                    color: var(--text-muted);
                }
                .mini-stat .value {
                    font-size: 0.95rem;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default StaffHub;
