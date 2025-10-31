import React, { useState, useMemo, useEffect } from 'react';
import { PickupRequest, WasteCategory, User, UserRole, PickupRequestStatus } from '../types';
import {
  PlasticIcon,
  OrganicIcon,
  MetalIcon,
  PaperIcon,
  GlassIcon,
  EWasteIcon,
  GeneralIcon
} from './icons';

interface AdminDashboardProps {
  users: User[];
  requests: PickupRequest[];
  onLogout: () => void;
  onAssignTeam: (requestId: string, team: User) => void;
  onManageTeam: (team: User, action: 'add' | 'update' | 'delete') => void;
}

type AdminTab = 'DASHBOARD' | 'USERS' | 'TEAMS' | 'REQUESTS';

const categoryDetails: { [key in WasteCategory]: { icon: React.FC<any>, name: string } } = {
  [WasteCategory.PLASTIC]: { icon: PlasticIcon, name: 'Plastic' },
  [WasteCategory.ORGANIC]: { icon: OrganicIcon, name: 'Organic' },
  [WasteCategory.METAL]: { icon: MetalIcon, name: 'Metal' },
  [WasteCategory.PAPER]: { icon: PaperIcon, name: 'Paper' },
  [WasteCategory.GLASS]: { icon: GlassIcon, name: 'Glass' },
  [WasteCategory.EWASTE]: { icon: EWasteIcon, name: 'E-Waste' },
  [WasteCategory.GENERAL]: { icon: GeneralIcon, name: 'General Waste' },
};

const allCities = [
  'New York', 'London', 'Tokyo', 'Chennai', 'Coimbatore', 'Madurai', 'Nammakal', 
  'Karur', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Tiruppur', 'Thoothukudi'
];

// Sub-components for each tab

const DashboardView: React.FC<{ users: User[], requests: PickupRequest[] }> = ({ users, requests }) => {
    const totalUsers = users.filter(u => u.role === UserRole.USER).length;
    const totalTeams = users.filter(u => u.role === UserRole.PICKUP_TEAM).length;
    const activePickups = requests.filter(r => r.status !== PickupRequestStatus.CONFIRMED_BY_USER).length;
    const wasteDistribution = requests.reduce((acc, req) => {
        acc[req.category] = (acc[req.category] || 0) + 1;
        return acc;
    }, {} as Record<WasteCategory, number>);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Total Users</h3>
                    <p className="text-4xl font-bold text-emerald-500">{totalUsers}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Pickup Teams</h3>
                    <p className="text-4xl font-bold text-emerald-500">{totalTeams}</p>
                </div>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow">
                    <h3 className="text-lg font-semibold">Active Pickups</h3>
                    <p className="text-4xl font-bold text-emerald-500">{activePickups}</p>
                </div>
            </div>
            <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Waste Distribution</h3>
                <div className="p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow space-y-2">
                    {Object.entries(wasteDistribution).map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center">
                            <span>{category}</span>
                            <span className="font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const UserManagementView: React.FC<{ users: User[] }> = ({ users }) => {
    const standardUsers = users.filter(u => u.role === UserRole.USER);
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {standardUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.contact || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{user.address || 'N/A'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const TeamManagementView: React.FC<{ teams: User[], onManageTeam: AdminDashboardProps['onManageTeam'] }> = ({ teams, onManageTeam }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTeam, setEditingTeam] = useState<User | null>(null);

    const openModal = (team: User | null = null) => {
        setEditingTeam(team);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingTeam(null);
        setIsModalOpen(false);
    };

    const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.target as HTMLFormElement);
        const teamData: Partial<User> = {
            username: formData.get('username') as string,
            password: 'password', // Default password
            role: UserRole.PICKUP_TEAM,
            vehicleInfo: formData.get('vehicleInfo') as string,
            operatesIn: formData.getAll('operatesIn') as string[],
        };
        
        if (editingTeam) {
            onManageTeam({ ...editingTeam, ...teamData }, 'update');
        } else {
            onManageTeam(teamData as User, 'add');
        }
        closeModal();
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Team Management</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700">Add New Team</button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    {/* ... table header ... */}
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {teams.map(team => (
                            <tr key={team.id}>
                                <td className="px-6 py-4">{team.username}</td>
                                <td className="px-6 py-4">{team.operatesIn?.join(', ') || 'N/A'}</td>
                                <td className="px-6 py-4">{team.vehicleInfo || 'N/A'}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => openModal(team)} className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                    <button onClick={() => onManageTeam(team, 'delete')} className="text-red-600 hover:text-red-900">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">{editingTeam ? 'Edit Team' : 'Add New Team'}</h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div>
                                <label>Team Name</label>
                                <input name="username" defaultValue={editingTeam?.username} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700" required />
                            </div>
                            <div>
                                <label>Vehicle Info</label>
                                <input name="vehicleInfo" defaultValue={editingTeam?.vehicleInfo} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700" required />
                            </div>
                            <div>
                                <label>Operating Cities</label>
                                <select name="operatesIn" multiple defaultValue={editingTeam?.operatesIn || []} className="mt-1 block w-full h-32 border-gray-300 rounded-md dark:bg-gray-700" required>
                                    {allCities.map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div className="flex justify-end gap-4 mt-6">
                                <button type="button" onClick={closeModal} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded-md">Cancel</button>
                                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded-md">Save</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const RequestsView: React.FC<{ requests: PickupRequest[], teams: User[], onAssignTeam: AdminDashboardProps['onAssignTeam'] }> = ({ requests, teams, onAssignTeam }) => {
    // Simplified view for brevity, can be expanded with more details
    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">All Pickup Requests</h2>
            <div className="space-y-4">
                {requests.map(req => (
                    <div key={req.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg shadow">
                       <p><strong>Request ID:</strong> {req.id.slice(0, 8)}...</p>
                       <p><strong>User:</strong> {req.user.username}</p>
                       <p><strong>Location:</strong> {req.location.place}, {req.location.city}</p>
                       <p><strong>Status:</strong> {req.status}</p>
                       <p><strong>Current Team:</strong> {req.assignedTeam.username}</p>
                       <div className="mt-2 flex items-center gap-2">
                            <select onChange={(e) => {
                                const team = teams.find(t => t.id === parseInt(e.target.value));
                                if(team) onAssignTeam(req.id, team);
                            }}
                            className="block w-full text-sm border-gray-300 rounded-md dark:bg-gray-700"
                            >
                                <option>Re-assign team...</option>
                                {teams.filter(t => t.operatesIn?.includes(req.location.city)).map(t => <option key={t.id} value={t.id}>{t.username}</option>)}
                            </select>
                       </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, requests, onLogout, onAssignTeam, onManageTeam }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

  const pickupTeams = useMemo(() => users.filter(u => u.role === UserRole.PICKUP_TEAM), [users]);
  
  const renderTabContent = () => {
    switch (activeTab) {
        case 'USERS': return <UserManagementView users={users} />;
        case 'TEAMS': return <TeamManagementView teams={pickupTeams} onManageTeam={onManageTeam} />;
        case 'REQUESTS': return <RequestsView requests={requests} teams={pickupTeams} onAssignTeam={onAssignTeam} />;
        case 'DASHBOARD':
        default:
            return <DashboardView users={users} requests={requests} />;
    }
  };

  return (
     <div>
        <header className="flex justify-between items-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                Admin Dashboard
            </h1>
            <button onClick={onLogout} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                Log Out
            </button>
        </header>
        <nav className="mb-6 flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700">
            {([
                ['DASHBOARD', 'Dashboard'],
                ['REQUESTS', 'Requests'],
                ['USERS', 'User Management'], 
                ['TEAMS', 'Team Management'], 
            ] as [AdminTab, string][]).map(([tabId, tabName]) => (
                <button
                    key={tabId}
                    onClick={() => setActiveTab(tabId)}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tabId ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {tabName}
                </button>
            ))}
        </nav>
        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            {renderTabContent()}
        </main>
     </div>
  );
};

export default AdminDashboard;
