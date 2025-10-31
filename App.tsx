import React, { useState, useEffect } from 'react';
import { User, PickupRequest, UserRole, PickupRequestStatus, Feedback } from './types';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserDashboard from './components/UserDashboard';
import AdminDashboard from './components/AdminDashboard';
import PickupTeamDashboard from './components/PickupTeamDashboard';

const initialMockUsers: User[] = [
  { id: 1, username: 'user', password: 'password', role: UserRole.USER, address: '123 Main St, Manhattan', contact: 'user@example.com' },
  { id: 2, username: 'admin', password: 'password', role: UserRole.ADMIN },
  { id: 3, username: 'NY Team Alpha', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['New York'], availability: 'AVAILABLE', vehicleInfo: 'Truck #NY101' },
  { id: 4, username: 'London Crew', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['London'], availability: 'AVAILABLE', vehicleInfo: 'Van #LC202' },
  { id: 5, username: 'Tokyo Green', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['Tokyo'], availability: 'UNAVAILABLE', vehicleInfo: 'Electric Cart #TG303' },
  { id: 6, username: 'NY Team Bravo', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['New York'], availability: 'AVAILABLE', vehicleInfo: 'Truck #NY102' },
  { id: 7, username: 'London Cleaners', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['London'], availability: 'AVAILABLE', vehicleInfo: 'Van #LC205' },
  { id: 8, username: 'Chennai Champs', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['Chennai'], availability: 'AVAILABLE', vehicleInfo: 'Tata Ace #CH01' },
  { id: 9, username: 'Kovai Kings', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['Coimbatore', 'Tiruppur', 'Erode'], availability: 'AVAILABLE', vehicleInfo: 'Mahindra Bolero #KOV02' },
  { id: 10, username: 'Madurai Panthers', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['Madurai', 'Tirunelveli', 'Thoothukudi'], availability: 'UNAVAILABLE', vehicleInfo: 'Force Traveller #MDU03' },
  { id: 11, username: 'Central TN Crew', password: 'password', role: UserRole.PICKUP_TEAM, operatesIn: ['Trichy', 'Karur', 'Salem', 'Nammakal', 'Vellore'], availability: 'AVAILABLE', vehicleInfo: 'Ashok Leyland Dost #TR04' },
];

type AppView = 'LOGIN' | 'SIGNUP' | 'DASHBOARD';

const App: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [pickupRequests, setPickupRequests] = useState<PickupRequest[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);
    const [currentView, setCurrentView] = useState<AppView>('LOGIN');

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('currentUser');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
                setCurrentView('DASHBOARD');
            }
            
            const storedRequests = localStorage.getItem('pickupRequests');
            if (storedRequests) setPickupRequests(JSON.parse(storedRequests));

            const storedUsers = localStorage.getItem('users');
            if (storedUsers) {
                setUsers(JSON.parse(storedUsers));
            } else {
                setUsers(initialMockUsers);
                localStorage.setItem('users', JSON.stringify(initialMockUsers));
            }

        } catch (error) {
            console.error("Failed to parse from localStorage", error);
            localStorage.clear();
            setUsers(initialMockUsers);
        }
        setIsInitialized(true);
    }, []);

    const updateUsersState = (updatedUsers: User[]) => {
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers));

        // If the current user was updated, update their state too
        if (currentUser) {
            const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
            if (updatedCurrentUser) {
                setCurrentUser(updatedCurrentUser);
                localStorage.setItem('currentUser', JSON.stringify(updatedCurrentUser));
            }
        }
    };

    const updateRequestsState = (updatedRequests: PickupRequest[]) => {
        setPickupRequests(updatedRequests);
        localStorage.setItem('pickupRequests', JSON.stringify(updatedRequests));
    };

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        setCurrentView('DASHBOARD');
    };

    const handleSignup = (newUser: Omit<User, 'id'>) => {
        const fullNewUser: User = {
            id: Date.now(),
            ...newUser,
            ...(newUser.role === UserRole.PICKUP_TEAM && {
                availability: 'AVAILABLE',
                vehicleInfo: 'Not specified',
            }),
        };
        const updatedUsers = [...users, fullNewUser];
        updateUsersState(updatedUsers);
        handleLogin(fullNewUser);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        localStorage.removeItem('currentUser');
        setCurrentView('LOGIN');
    };

    const handleAddRequest = (request: Omit<PickupRequest, 'assignedTeam' | 'status'>) => {
        const availableTeams = users.filter(u => 
            u.role === UserRole.PICKUP_TEAM && 
            u.operatesIn?.includes(request.location.city) &&
            u.availability === 'AVAILABLE'
        );

        // Simple auto-assignment: pick the first available team
        const assignedTeam = availableTeams.length > 0 ? availableTeams[0] : users.find(u => u.username === 'admin'); // Fallback to admin

        if (!assignedTeam) {
            // Handle case where no team is available
            console.error("No available pickup team found for this location.");
            // In a real app, you might queue this or notify the user.
            return;
        }

        const newRequest: PickupRequest = {
            ...request,
            assignedTeam,
            status: PickupRequestStatus.ASSIGNED,
        };

        const updatedRequests = [...pickupRequests, newRequest];
        updateRequestsState(updatedRequests);
    };

    const handleAssignTeam = (requestId: string, team: User) => {
        const updatedRequests = pickupRequests.map(req => 
            req.id === requestId 
            ? { ...req, assignedTeam: team, status: PickupRequestStatus.ASSIGNED } 
            : req
        );
        updateRequestsState(updatedRequests);
    };

    const handleUpdateUser = (updatedUser: User) => {
        const updatedUsers = users.map(u => u.id === updatedUser.id ? updatedUser : u);
        updateUsersState(updatedUsers);
    };

    const handleUpdatePickupRequest = (requestId: string, newStatus: PickupRequestStatus, proofImage?: string) => {
        const updatedRequests = pickupRequests.map(req => {
            if (req.id === requestId) {
                return { 
                    ...req, 
                    status: newStatus,
                    ...(proofImage && { collectionProofImage: proofImage }) 
                };
            }
            return req;
        });
        updateRequestsState(updatedRequests);
    };
    
    const handleConfirmPickup = (requestId: string, feedback: Feedback) => {
        const updatedRequests = pickupRequests.map(req =>
            req.id === requestId ? { ...req, status: PickupRequestStatus.CONFIRMED_BY_USER, feedback } : req
        );
        updateRequestsState(updatedRequests);
    };

    const handleManageTeam = (team: User, action: 'add' | 'update' | 'delete') => {
        let updatedUsers = [...users];
        if (action === 'add') {
            updatedUsers.push({ ...team, id: Date.now() });
        } else if (action === 'update') {
            updatedUsers = users.map(u => u.id === team.id ? team : u);
        } else if (action === 'delete') {
            updatedUsers = users.filter(u => u.id !== team.id);
        }
        updateUsersState(updatedUsers);
    };

    if (!isInitialized) {
        return null;
    }

    const renderContent = () => {
        if (currentView === 'SIGNUP') {
            return <SignupPage onSignup={handleSignup} onSwitchToLogin={() => setCurrentView('LOGIN')} users={users} />;
        }
        
        if (currentView === 'LOGIN' || !currentUser) {
            return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentView('SIGNUP')} users={users} />;
        }
        
        switch(currentUser.role) {
            case UserRole.ADMIN:
                return <AdminDashboard users={users} requests={pickupRequests} onLogout={handleLogout} onAssignTeam={handleAssignTeam} onManageTeam={handleManageTeam} />;
            case UserRole.PICKUP_TEAM:
                const teamRequests = pickupRequests.filter(req => req.assignedTeam?.id === currentUser.id);
                return <PickupTeamDashboard requests={teamRequests} currentUser={currentUser} onLogout={handleLogout} onUpdateUser={handleUpdateUser} onUpdateRequest={handleUpdatePickupRequest} />;
            case UserRole.USER:
            default:
                const userRequests = pickupRequests.filter(req => req.user.id === currentUser.id);
                return <UserDashboard user={currentUser} requests={userRequests} onAddRequest={handleAddRequest} onLogout={handleLogout} onConfirmPickup={handleConfirmPickup} onUpdateUser={handleUpdateUser} />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
            <div className="w-full max-w-6xl mx-auto">
                {renderContent()}
            </div>
             <footer className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
                <p>&copy; {new Date().getFullYear()} EcoTech Solutions. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default App;
