
import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-20">
      <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-emerald-500"></div>
      <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Analyzing Your Waste...</h2>
      <p className="text-gray-500 dark:text-gray-400">Our AI is working its magic!</p>
    </div>
  );
};

export default Loader;
