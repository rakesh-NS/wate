import React, { useState } from 'react';
import { User } from '../types';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onSwitchToSignup: () => void;
  users: User[];
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSwitchToSignup, users }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
        setError('Please enter both username and password.');
        return;
    }
    const foundUser = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    
    if (foundUser && foundUser.password === password) {
      onLogin(foundUser);
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <>
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Smart Waste Sorter
          </h1>
          <p className="mt-3 text-lg text-gray-600 dark:text-gray-400">
            Please log in to continue.
          </p>
        </header>

        <main className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-md mx-auto">
            <form onSubmit={handleLogin} className="space-y-6">
                <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Username
                    </label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="e.g., 'user', 'admin', or 'London Cleaners'"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                        aria-required="true"
                    />
                </div>
                 <div>
                    <label htmlFor="password" aria-label="Password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Default is 'password'"
                        className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500"
                    />
                </div>
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
                        Log In
                    </button>
                </div>
            </form>
             <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <button onClick={onSwitchToSignup} className="font-medium text-emerald-600 hover:text-emerald-500">
                    Sign Up
                </button>
            </p>
        </main>
    </>
  );
};

export default LoginPage;