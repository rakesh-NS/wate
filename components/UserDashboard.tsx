import React, { useState, useCallback, useEffect } from 'react';
import { classifyWaste, getCityFromCoordinates } from '../services/geminiService';
import { WasteCategory, ClassificationResponse, User, Location, PickupRequest, PickupRequestStatus, Feedback } from '../types';
import FileUpload from './FileUpload';
import Loader from './Loader';
import ResultCard from './ResultCard';

interface UserDashboardProps {
  user: User;
  requests: PickupRequest[];
  onAddRequest: (request: Omit<PickupRequest, 'assignedTeam'|'status'>) => void;
  onLogout: () => void;
  onConfirmPickup: (requestId: string, feedback: Feedback) => void;
  onUpdateUser: (user: User) => void;
}

type UserTab = 'NEW_REQUEST' | 'HISTORY' | 'PROFILE';

const locations: Record<string, string[]> = {
  'New York': ['Manhattan', 'Brooklyn', 'Queens', 'The Bronx', 'Staten Island'],
  'London': ['Westminster', 'Camden', 'Greenwich', 'Islington', 'Southwark', 'Tower Hamlets'],
  'Tokyo': ['Shibuya', 'Shinjuku', 'Chiyoda', 'Minato', 'Taito', 'Sumida'],
  'Chennai': [
    'Adyar', 'Anna Nagar', 'Besant Nagar', 'Chromepet', 'Guindy', 'Koyambedu', 
    'Mylapore', 'Nungambakkam', 'Porur', 'T. Nagar', 'Tambaram', 'Thiruvanmiyur', 
    'Vadapalani', 'Velachery', 'Ashok Nagar', 'Egmore', 'Perambur', 'Saidapet'
  ],
  'Coimbatore': [
    'RS Puram', 'Gandhipuram', 'Saibaba Colony', 'Peelamedu', 'Singanallur', 
    'Ukkadam', 'Town Hall', 'Race Course', 'Saravanampatti', 'Vadavalli', 
    'Kovaipudur', 'Ganapathy', 'Pollachi', 'Mettupalayam'
  ],
  'Madurai': [
    'Anna Nagar', 'Simmakkal', 'Goripalayam', 'KK Nagar', 'Periyar Bus Stand', 
    'Tallakulam', 'Mattuthavani', 'Thiruparankundram', 'Vilakkuthun', 'Arapalayam'
  ],
  'Nammakal': [
    'Bus Stand Area', 'Mohanur Road', 'Rasipuram', 'Sellappampatti', 'Tiruchengode', 
    'Pallipalayam', 'Kumarapalayam', 'Paramathi-Velur', 'Velagoundampatti', 'Erumapatti'
  ],
  'Karur': [
    'Bus Stand Area', 'Jawahar Bazaar', 'Pasupathipalayam', 'Thanthonimalai', 
    'Vengamedu', 'Kulithalai', 'Aravakurichi', 'Krishnarayapuram'
  ],
  'Trichy': [
    'Srirangam', 'Thillai Nagar', 'Cantonment', 'Samayapuram', 'Central Bus Stand', 
    'Chathiram Bus Stand', 'Woraiyur', 'Tiruverumbur', 'Golden Rock', 'Lalgudi', 'Manapparai'
  ],
  'Salem': [
    'Five Roads', 'Old Bus Stand', 'New Bus Stand', 'Hasthampatti', 'Omalur', 
    'Attur', 'Yercaud Foothills', 'Gugai', 'Shevapet', 'Mettur'
  ],
  'Tirunelveli': [
    'Junction', 'Palayamkottai', 'Vannarpettai', 'Tirunelveli Town', 'Melapalayam', 
    'Ambasamudram', 'Tenkasi', 'Sankarankovil'
  ],
  'Vellore': [
    'CMC Hospital Area', 'Katpadi', 'Fort City', 'Bagayam', 'Sathuvachari', 
    'Gudiyatham', 'Vaniyambadi', 'Ambur'
  ],
  'Erode': [
    'Bus Stand Area', 'Gandhiji Road', 'Perundurai', 'Bhavani', 'Gobichetipalayam', 
    'Sathyamangalam', 'Solar', 'Brough Road'
  ],
  'Tiruppur': [
    'Avinashi Road', 'PN Road', 'Town Hall', 'Kangayam Road', 'Palladam Road', 
    'Dharapuram', 'Udumalaipettai'
  ],
  'Thoothukudi': [
    'VOC Port Area', 'Millerpuram', 'Ettayapuram Road', 'Tuticorin Town', 
    'SIPCOT Industrial Complex', 'Kovilpatti', 'Tiruchendur', 'Srivaikuntam'
  ],
};


type LocationStatus = 'DETECTING' | 'MANUAL' | 'DETECTED';

const StarRating: React.FC<{ rating: number; onRatingChange: (rating: number) => void }> = ({ rating, onRatingChange }) => {
    return (
        <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    onClick={() => onRatingChange(star)}
                    className={`text-3xl transition-colors ${star <= rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                    aria-label={`Rate ${star} stars`}
                >
                    ★
                </button>
            ))}
        </div>
    );
};

const NewRequestView: React.FC<Pick<UserDashboardProps, 'user' | 'onAddRequest'>> = ({ user, onAddRequest }) => {
    const [location, setLocation] = useState<Location | null>(null);
    const [locationStatus, setLocationStatus] = useState<LocationStatus>('MANUAL');
    const [locationError, setLocationError] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string>(Object.keys(locations)[0]);
    const [manualPlace, setManualPlace] = useState<string>('');
    const [isDetecting, setIsDetecting] = useState<boolean>(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [pickupDate, setPickupDate] = useState('');
    const [pickupTimeSlot, setPickupTimeSlot] = useState('9:00 AM - 12:00 PM');
    const [requestSubmitted, setRequestSubmitted] = useState<PickupRequest | null>(null);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        const locationJson = await getCityFromCoordinates(latitude, longitude);
                        const detectedLocation: Location = JSON.parse(locationJson);

                        if (Object.keys(locations).includes(detectedLocation.city)) {
                            setSelectedCity(detectedLocation.city);
                            setManualPlace(detectedLocation.place);
                            setLocationError("We've pre-filled your location. Please confirm or adjust it.");
                        } else {
                            setLocationError(`Service not available in your detected city (${detectedLocation.city}). Please select a supported location.`);
                        }
                    } catch (err) {
                        setLocationError("Could not automatically determine your city. Please select it manually.");
                    } finally {
                        setIsDetecting(false);
                    }
                },
                () => {
                    setLocationError("Could not access your location. Please select it manually.");
                    setIsDetecting(false);
                }
            );
        } else {
            setLocationError("Geolocation is not supported. Please select your location manually.");
            setIsDetecting(false);
        }
    }, []);

    const handleLocationSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!manualPlace.trim()) {
            setLocationError("Please enter your area or neighborhood.");
            return;
        }
        setLocation({ city: selectedCity, place: manualPlace });
        setLocationStatus('DETECTED');
    };

    const handleFileChange = (file: File) => {
        setImageFile(file);
        const reader = new FileReader();
        reader.onloadend = () => { setImagePreview(reader.result as string); };
        reader.readAsDataURL(file);
        setError(null);
    };

    const handleClassify = useCallback(async () => {
        if (!imageFile || !imagePreview || !location || !pickupDate || !pickupTimeSlot) {
            setError("Please upload an image and select a pickup date and time.");
            return;
        }

        setIsLoading(true);
        setError(null);
        
        try {
            const base64Data = imagePreview.split(',')[1];
            const result = await classifyWaste(base64Data, imageFile.type);
            const parsedResult: ClassificationResponse = JSON.parse(result);

            if (parsedResult.isAnimated) {
                setError(`Animated images are not supported. ${parsedResult.animationExplanation || 'Please upload a static image.'}`);
                setIsLoading(false);
                return;
            }
            
            const newRequest: Omit<PickupRequest, 'assignedTeam' | 'status'> = {
                id: new Date().toISOString(),
                user,
                location,
                imagePreview,
                pickupDate,
                pickupTimeSlot,
                ...parsedResult,
            };
            onAddRequest(newRequest);
            
            setRequestSubmitted({ ...newRequest, assignedTeam: { username: 'Auto-Assigned' } as User, status: PickupRequestStatus.ASSIGNED });

        } catch (err) {
            setError("Sorry, we couldn't classify the waste. Please try another photo.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, imagePreview, location, user, onAddRequest, pickupDate, pickupTimeSlot]);
    
    const handleFullReset = () => {
        setImageFile(null);
        setImagePreview(null);
        setIsLoading(false);
        setError(null);
        setPickupDate('');
        setPickupTimeSlot('9:00 AM - 12:00 PM');
        setRequestSubmitted(null);
    };

    if (locationStatus !== 'DETECTED' || !location) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
                 {isDetecting ? (
                    <div className="flex flex-col items-center justify-center space-y-4 py-10">
                        <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
                        <h2 className="text-xl font-semibold">Detecting your location...</h2>
                    </div>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold text-center mb-2">Set Your Pickup Location</h2>
                        {locationError && <p className="text-center text-yellow-700 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-300 p-3 rounded-lg mb-4 text-sm">{locationError}</p>}
                        <form onSubmit={handleLocationSubmit} className="max-w-md mx-auto space-y-4">
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">City</label>
                                <select id="city" name="city" value={selectedCity} onChange={(e) => setSelectedCity(e.target.value)} className="mt-1 block w-full text-base border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 rounded-md dark:bg-gray-700">
                                    {Object.keys(locations).map(city => <option key={city} value={city}>{city}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="place" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Area / Place</label>
                                <input 
                                    id="place" 
                                    name="place" 
                                    type="text"
                                    value={manualPlace}
                                    onChange={(e) => setManualPlace(e.target.value)}
                                    placeholder="e.g., Adyar, Manhattan, Sellappampatti"
                                    required
                                    className="mt-1 block w-full text-base border-gray-300 dark:border-gray-600 focus:ring-emerald-500 focus:border-emerald-500 rounded-md dark:bg-gray-700"
                                />
                            </div>
                            <button type="submit" className="w-full mt-4 flex justify-center py-3 px-4 rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700">Confirm Location</button>
                        </form>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8">
            <div className="text-center mb-6">
                <p className="text-sm text-gray-500">Location Set</p>
                <p className="font-semibold">{location.place}, {location.city}</p>
                 <button onClick={() => setLocationStatus('MANUAL')} className="text-xs text-emerald-500 hover:underline">Change</button>
            </div>
            {isLoading ? <Loader /> : requestSubmitted ? (
                <ResultCard request={requestSubmitted} onReset={handleFullReset} />
            ) : (
                <div className="space-y-6">
                    <FileUpload onFileChange={handleFileChange} imagePreview={imagePreview} />
                    {imagePreview && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="pickup-date" className="block text-sm font-medium">Pickup Date</label>
                                <input 
                                    type="date" 
                                    id="pickup-date" 
                                    value={pickupDate}
                                    onChange={e => setPickupDate(e.target.value)}
                                    min={new Date().toISOString().split("T")[0]}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700"
                                />
                            </div>
                             <div>
                                <label htmlFor="pickup-time" className="block text-sm font-medium">Time Slot</label>
                                <select 
                                    id="pickup-time"
                                    value={pickupTimeSlot}
                                    onChange={e => setPickupTimeSlot(e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700"
                                >
                                    <option>9:00 AM - 12:00 PM</option>
                                    <option>12:00 PM - 3:00 PM</option>
                                    <option>3:00 PM - 6:00 PM</option>
                                </select>
                            </div>
                        </div>
                    )}
                    {error && <p className="mt-4 text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
                    {imagePreview && (
                        <div className="mt-6 flex justify-center">
                            <button onClick={handleClassify} disabled={isLoading || !pickupDate} className="w-full sm:w-auto px-8 py-4 bg-emerald-600 text-white font-bold text-lg rounded-xl hover:bg-emerald-700 disabled:bg-gray-400">
                                Classify & Schedule Pickup
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

const HistoryView: React.FC<Pick<UserDashboardProps, 'requests' | 'onConfirmPickup'>> = ({ requests, onConfirmPickup }) => {
    // ... (HistoryView logic remains largely the same, just showing new status)
    const [feedback, setFeedback] = useState<Record<string, { rating: number; comment: string }>>({});

    const handleFeedbackChange = (id: string, rating: number, comment: string) => {
        setFeedback(prev => ({ ...prev, [id]: { rating, comment } }));
    };

    const sortedRequests = [...requests].sort((a, b) => new Date(b.id).getTime() - new Date(a.id).getTime());

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Your Pickup History</h2>
            {sortedRequests.length === 0 ? <p>You have no pickup requests yet.</p> : (
                <div className="space-y-6">
                    {sortedRequests.map(req => (
                        <div key={req.id} className="p-4 border dark:border-gray-700 rounded-lg">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="font-bold">{req.category}</p>
                                    <p className="text-sm">{req.location.place}, {req.location.city}</p>
                                    <p className="text-xs text-gray-500">{new Date(req.id).toLocaleString()}</p>
                                </div>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${ {
                                    [PickupRequestStatus.PENDING]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
                                    [PickupRequestStatus.ASSIGNED]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
                                    [PickupRequestStatus.IN_PROGRESS]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300',
                                    [PickupRequestStatus.COMPLETED_BY_TEAM]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300',
                                    [PickupRequestStatus.CONFIRMED_BY_USER]: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300',
                                }[req.status]}`}>{req.status.replace(/_/g, ' ')}</span>
                            </div>
                            {req.status === PickupRequestStatus.COMPLETED_BY_TEAM && (
                                <div className="mt-4 pt-4 border-t dark:border-gray-700">
                                    <h3 className="font-semibold">Confirm Pickup & Leave Feedback</h3>
                                    <StarRating rating={feedback[req.id]?.rating || 0} onRatingChange={(r) => handleFeedbackChange(req.id, r, feedback[req.id]?.comment || '')} />
                                    <textarea
                                        placeholder="Add a comment..."
                                        value={feedback[req.id]?.comment || ''}
                                        onChange={(e) => handleFeedbackChange(req.id, feedback[req.id]?.rating || 0, e.target.value)}
                                        className="mt-2 w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                                    />
                                    <button 
                                        onClick={() => onConfirmPickup(req.id, feedback[req.id] || { rating: 0, comment: ''})} 
                                        disabled={!feedback[req.id] || feedback[req.id].rating === 0}
                                        className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded disabled:bg-gray-400"
                                    >
                                        Confirm & Submit Feedback
                                    </button>
                                </div>
                            )}
                            {req.feedback && (
                                <div className="mt-2 pt-2 border-t dark:border-gray-700 text-sm">
                                    <p>Your Feedback: {'★'.repeat(req.feedback.rating)}{'☆'.repeat(5 - req.feedback.rating)}</p>
                                    <p className="text-gray-600 dark:text-gray-400 italic">"{req.feedback.comment}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const ProfileView: React.FC<{ user: User, onUpdateUser: (user: User) => void }> = ({ user, onUpdateUser }) => {
    const [address, setAddress] = useState(user.address || '');
    const [contact, setContact] = useState(user.contact || '');

    const handleSave = () => {
        onUpdateUser({ ...user, address, contact });
        alert("Profile updated successfully!");
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8">
            <h2 className="text-2xl font-bold mb-6">Your Profile</h2>
            <div className="space-y-4 max-w-md">
                <div>
                    <label className="block text-sm font-medium">Username</label>
                    <p className="mt-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-md">{user.username}</p>
                </div>
                <div>
                    <label htmlFor="address" className="block text-sm font-medium">Address</label>
                    <input id="address" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <div>
                    <label htmlFor="contact" className="block text-sm font-medium">Contact (Email/Phone)</label>
                    <input id="contact" value={contact} onChange={e => setContact(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                </div>
                <button onClick={handleSave} className="px-6 py-2 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700">Save Changes</button>
            </div>
        </div>
    );
};

const UserDashboard: React.FC<UserDashboardProps> = ({ user, requests, onAddRequest, onLogout, onConfirmPickup, onUpdateUser }) => {
    const [activeTab, setActiveTab] = useState<UserTab>('NEW_REQUEST');

    const renderTabContent = () => {
        switch (activeTab) {
            case 'HISTORY': return <HistoryView requests={requests} onConfirmPickup={onConfirmPickup} />;
            case 'PROFILE': return <ProfileView user={user} onUpdateUser={onUpdateUser} />;
            case 'NEW_REQUEST':
            default:
                return <NewRequestView user={user} onAddRequest={onAddRequest} />;
        }
    };

    return (
        <div>
            <header className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Welcome, {user.username}!</h1>
                <button onClick={onLogout} className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700">Log Out</button>
            </header>
            <nav className="mb-6 flex space-x-2 border-b-2 border-gray-200 dark:border-gray-700">
                {([['NEW_REQUEST', 'New Request'], ['HISTORY', 'History'], ['PROFILE', 'Profile']] as [UserTab, string][]).map(([tabId, tabName]) => (
                    <button
                        key={tabId}
                        onClick={() => setActiveTab(tabId)}
                        className={`px-4 py-2 text-sm font-medium transition-colors ${activeTab === tabId ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                    >
                        {tabName}
                    </button>
                ))}
            </nav>
            <main>
                {renderTabContent()}
            </main>
        </div>
    );
};

export default UserDashboard;