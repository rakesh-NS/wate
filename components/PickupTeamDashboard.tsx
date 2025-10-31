import React, { useMemo, useState } from 'react';
import { PickupRequest, WasteCategory, User, PickupRequestStatus } from '../types';
import {
  PlasticIcon,
  OrganicIcon,
  MetalIcon,
  PaperIcon,
  GlassIcon,
  EWasteIcon,
  GeneralIcon
} from './icons';

interface PickupTeamDashboardProps {
  requests: PickupRequest[];
  currentUser: User;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
  onUpdateRequest: (requestId: string, status: PickupRequestStatus, proofImage?: string) => void;
}

type TeamTab = 'JOBS' | 'PERFORMANCE' | 'PROFILE';

const categoryDetails: { [key in WasteCategory]: { icon: React.FC<any>, name: string } } = {
  [WasteCategory.PLASTIC]: { icon: PlasticIcon, name: 'Plastic' },
  [WasteCategory.ORGANIC]: { icon: OrganicIcon, name: 'Organic' },
  [WasteCategory.METAL]: { icon: MetalIcon, name: 'Metal' },
  [WasteCategory.PAPER]: { icon: PaperIcon, name: 'Paper' },
  [WasteCategory.GLASS]: { icon: GlassIcon, name: 'Glass' },
  [WasteCategory.EWASTE]: { icon: EWasteIcon, name: 'E-Waste' },
  [WasteCategory.GENERAL]: { icon: GeneralIcon, name: 'General Waste' },
};

const JobsView: React.FC<Pick<PickupTeamDashboardProps, 'requests' | 'onUpdateRequest'>> = ({ requests, onUpdateRequest }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentRequest, setCurrentRequest] = useState<PickupRequest | null>(null);
    const [proofImage, setProofImage] = useState<string | null>(null);

    const openCompletionModal = (request: PickupRequest) => {
        setCurrentRequest(request);
        setIsModalOpen(true);
    };

    const handleProofImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setProofImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleCompleteJob = () => {
        if (currentRequest && proofImage) {
            onUpdateRequest(currentRequest.id, PickupRequestStatus.COMPLETED_BY_TEAM, proofImage);
            setIsModalOpen(false);
            setCurrentRequest(null);
            setProofImage(null);
        }
    };

    const sortedRequests = [...requests].sort((a,b) => (a.status > b.status) ? 1 : ((b.status > a.status) ? -1 : 0));

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Your Assigned Pickups</h2>
            {requests.length === 0 ? (
                <p className="text-center text-gray-500 py-10">You have no pickups assigned.</p>
            ) : (
                <div className="space-y-4">
                    {sortedRequests.map(req => (
                        <div key={req.id} className="p-4 border rounded-lg">
                           <p className="font-bold">{req.category} pickup for {req.user.username}</p>
                           <p className="text-sm">{req.location.place}, {req.location.city}</p>
                           <p className="text-xs text-gray-500">Status: {req.status.replace(/_/g, ' ')}</p>
                           <div className="mt-2 flex gap-2">
                               {req.status === PickupRequestStatus.ASSIGNED && <button onClick={() => onUpdateRequest(req.id, PickupRequestStatus.IN_PROGRESS)} className="px-3 py-1 bg-blue-500 text-white rounded">Start Pickup</button>}
                               {req.status === PickupRequestStatus.IN_PROGRESS && <button onClick={() => openCompletionModal(req)} className="px-3 py-1 bg-emerald-600 text-white rounded">Complete Pickup</button>}
                           </div>
                        </div>
                    ))}
                </div>
            )}
            {isModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-sm">
                        <h3 className="font-bold text-lg mb-4">Complete Pickup</h3>
                        <p className="text-sm mb-4">Upload a photo as proof of collection.</p>
                        <input type="file" accept="image/*" onChange={handleProofImageUpload} className="mb-4 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"/>
                        {proofImage && <img src={proofImage} alt="proof" className="max-h-40 mx-auto rounded mb-4"/>}
                        <div className="flex justify-end gap-2">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-600 rounded">Cancel</button>
                            <button onClick={handleCompleteJob} disabled={!proofImage} className="px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-400">Submit</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const PerformanceView: React.FC<{ requests: PickupRequest[] }> = ({ requests }) => {
    const completed = requests.filter(r => r.status === PickupRequestStatus.CONFIRMED_BY_USER);
    const averageRating = completed.reduce((acc, req) => acc + (req.feedback?.rating || 0), 0) / (completed.length || 1);

    return (
        <div>
            <h2 className="text-2xl font-bold mb-6">Your Performance</h2>
            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                    <p>Total Completed Pickups</p>
                    <p className="text-3xl font-bold">{completed.length}</p>
                </div>
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
                    <p>Average Rating</p>
                    <p className="text-3xl font-bold">{'★'.repeat(Math.round(averageRating))}{'☆'.repeat(5 - Math.round(averageRating))}</p>
                </div>
            </div>
        </div>
    );
};

const ProfileView: React.FC<{ user: User; onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    const [vehicleInfo, setVehicleInfo] = useState(user.vehicleInfo || '');
    const [availability, setAvailability] = useState(user.availability || 'AVAILABLE');
    
    const handleSave = () => {
        onUpdateUser({ ...user, vehicleInfo, availability });
        alert("Profile updated!");
    };

    return (
         <div>
            <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
            <div className="space-y-4">
                <div>
                    <label>Vehicle Information</label>
                    <input value={vehicleInfo} onChange={e => setVehicleInfo(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700"/>
                </div>
                <div>
                    <label>Availability</label>
                    <select value={availability} onChange={e => setAvailability(e.target.value as 'AVAILABLE' | 'UNAVAILABLE')} className="mt-1 block w-full border-gray-300 rounded-md dark:bg-gray-700">
                        <option value="AVAILABLE">Available</option>
                        <option value="UNAVAILABLE">Unavailable</option>
                    </select>
                </div>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded">Save Changes</button>
            </div>
        </div>
    );
};


const PickupTeamDashboard: React.FC<PickupTeamDashboardProps> = ({ requests, currentUser, onLogout, onUpdateUser, onUpdateRequest }) => {
  const [activeTab, setActiveTab] = useState<TeamTab>('JOBS');

  return (
     <div>
        <header className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                    Pickup Dashboard
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400">Welcome, {currentUser.username}!</p>
            </div>
            <button onClick={onLogout} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">
                Log Out
            </button>
        </header>

        <nav className="mb-6 flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700">
            {([['JOBS', 'Assigned Jobs'], ['PERFORMANCE', 'Performance'], ['PROFILE', 'Profile']] as [TeamTab, string][]).map(([tabId, tabName]) => (
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
            {activeTab === 'JOBS' && <JobsView requests={requests} onUpdateRequest={onUpdateRequest} />}
            {activeTab === 'PERFORMANCE' && <PerformanceView requests={requests} />}
            {activeTab === 'PROFILE' && <ProfileView user={currentUser} onUpdateUser={onUpdateUser} />}
        </main>
     </div>
  );
};

export default PickupTeamDashboard;
