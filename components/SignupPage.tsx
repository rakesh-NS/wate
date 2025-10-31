import React, { useState } from 'react';
import { User, UserRole } from '../types';

interface SignupPageProps {
  onSignup: (user: Omit<User, 'id'>) => void;
  onSwitchToLogin: () => void;
  users: User[];
}

const allCities = [
  'New York', 'London', 'Tokyo', 'Chennai', 'Coimbatore', 'Madurai', 'Nammakal', 
  'Karur', 'Trichy', 'Salem', 'Tirunelveli', 'Vellore', 'Erode', 'Tiruppur', 'Thoothukudi'
];

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onSwitchToLogin, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [operatesIn, setOperatesIn] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [contact, setContact] = useState('');
  const [error, setError] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password || !role) {
      setError('Please fill in all required fields.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    if (role === UserRole.PICKUP_TEAM && operatesIn.length === 0) {
        setError('Please select at least one city for the pickup team.');
        return;
    }
    const isUsernameTaken = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (isUsernameTaken) {
      setError('This username is already taken. Please choose another.');
      return;
    }

    const isPasswordTaken = users.some(u => u.password === password);
    if (isPasswordTaken) {
        setError('This password is already in use. Please choose a unique password.');
        return;
    }
    
    const newUser: Omit<User, 'id'> = {
        username,
        password,
        role,
        ...(role === UserRole.PICKUP_TEAM ? { operatesIn } : { address, contact }),
    };
    
    onSignup(newUser);
  };

  const handleOperatesInChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = [...e.target.selectedOptions].map(option => option.value);
    setOperatesIn(selectedOptions);
  };

  return (
    <>
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Create Your Account
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Join EcoTech Solutions and help us manage waste smarter.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto">
            <form onSubmit={handleSignup} className="space-y-6">
                <div>
                    <label htmlFor="role-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        I am a...
                    </label>
                    <select
                        id="role-signup"
                        value={role}
                        onChange={(e) => setRole(e.target.value as UserRole)}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        aria-required="true"
                    >
                        <option value={UserRole.USER}>Standard User</option>
                        <option value={UserRole.PICKUP_TEAM}>Pickup Team</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="username-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        {role === UserRole.PICKUP_TEAM ? 'Team Name' : 'Username'}
                    </label>
                    <input
                        id="username-signup"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder={role === UserRole.PICKUP_TEAM ? 'e.g., Green Warriors' : 'Choose a unique username'}
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        aria-required="true"
                    />
                </div>

                 <div>
                    <label htmlFor="password-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Minimum 6 characters, must be unique"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        aria-required="true"
                    />
                </div>

                {role === UserRole.USER && (
                    <>
                        <div>
                            <label htmlFor="address-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address</label>
                            <input id="address-signup" type="text" value={address} onChange={e => setAddress(e.target.value)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                        <div>
                            <label htmlFor="contact-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact (Email or Phone)</label>
                            <input id="contact-signup" type="text" value={contact} onChange={e => setContact(e.target.value)} className="mt-1 block w-full rounded-md dark:bg-gray-700 border-gray-300 dark:border-gray-600"/>
                        </div>
                    </>
                )}


                {role === UserRole.PICKUP_TEAM && (
                    <div>
                        <label htmlFor="operates-in-signup" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Operating Cities (hold Ctrl/Cmd to select multiple)
                        </label>
                        <select
                            id="operates-in-signup"
                            multiple
                            value={operatesIn}
                            onChange={handleOperatesInChange}
                            className="mt-1 block w-full h-32 px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                            aria-required="true"
                        >
                            {allCities.map(city => <option key={city} value={city}>{city}</option>)}
                        </select>
                    </div>
                )}

                 {error && (
                    <div className="text-center text-red-500 bg-red-100 dark:bg-red-900/20 p-3 rounded-lg">
                        <p>{error}</p>
                    </div>
                )}
                <div>
                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                    >
                        Sign Up
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <button onClick={onSwitchToLogin} className="font-medium text-emerald-600 hover:text-emerald-500">
                    Log In
                </button>
            </p>
        </main>
    </>
  );
};

export default SignupPage;