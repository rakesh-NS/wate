import React from 'react';
import { ClassificationResponse, PickupRequest, WasteCategory } from '../types';
import {
  PlasticIcon,
  OrganicIcon,
  MetalIcon,
  PaperIcon,
  GlassIcon,
  EWasteIcon,
  GeneralIcon
} from './icons';

interface ResultCardProps {
  request: PickupRequest;
  onReset: () => void;
}

const categoryDetails: { [key in WasteCategory]: { icon: React.FC<any>, color: string, name: string } } = {
  [WasteCategory.PLASTIC]: { icon: PlasticIcon, color: 'blue', name: 'Plastic' },
  [WasteCategory.ORGANIC]: { icon: OrganicIcon, color: 'green', name: 'Organic' },
  [WasteCategory.METAL]: { icon: MetalIcon, color: 'slate', name: 'Metal' },
  [WasteCategory.PAPER]: { icon: PaperIcon, color: 'orange', name: 'Paper' },
  [WasteCategory.GLASS]: { icon: GlassIcon, color: 'cyan', name: 'Glass' },
  [WasteCategory.EWASTE]: { icon: EWasteIcon, color: 'indigo', name: 'E-Waste' },
  [WasteCategory.GENERAL]: { icon: GeneralIcon, color: 'gray', name: 'General Waste' },
};

const colorClasses = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-300',
    border: 'border-blue-500',
  },
  green: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-600 dark:text-green-300',
    border: 'border-green-500',
  },
  slate: {
    bg: 'bg-slate-100 dark:bg-slate-900/30',
    text: 'text-slate-600 dark:text-slate-300',
    border: 'border-slate-500',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-600 dark:text-orange-300',
    border: 'border-orange-500',
  },
  cyan: {
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-600 dark:text-cyan-300',
    border: 'border-cyan-500',
  },
  indigo: {
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-600 dark:text-indigo-300',
    border: 'border-indigo-500',
  },
  gray: {
    bg: 'bg-gray-100 dark:bg-gray-700/30',
    text: 'text-gray-600 dark:text-gray-300',
    border: 'border-gray-500',
  },
};

const ResultCard: React.FC<ResultCardProps> = ({ request, onReset }) => {
  const details = categoryDetails[request.category] || categoryDetails[WasteCategory.GENERAL];
  const colors = colorClasses[details.color as keyof typeof colorClasses];
  const Icon = details.icon;
  
  return (
    <div className="animate-fade-in text-center">
      <div className={`inline-flex items-center justify-center py-2 px-6 rounded-full font-bold text-2xl ${colors.bg} ${colors.text}`}>
        <Icon className="w-8 h-8 mr-3" />
        <span>{details.name}</span>
      </div>
      
      <p className="mt-4 text-gray-600 dark:text-gray-400 italic">
        "{request.reasoning}"
      </p>

      <div className={`mt-8 p-6 border-l-4 ${colors.border} ${colors.bg} rounded-r-lg text-left`}>
        <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">Pickup Scheduled!</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Your request has been submitted and a team has been assigned.</p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center">
            <span className="w-24 font-semibold">Team:</span>
            <span className="text-gray-700 dark:text-gray-300">{request.assignedTeam.username}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-semibold">Date:</span>
            <span className="text-gray-700 dark:text-gray-300">{new Date(request.pickupDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
          <div className="flex items-center">
            <span className="w-24 font-semibold">Time:</span>
            <span className="text-gray-700 dark:text-gray-300">{request.pickupTimeSlot}</span>
          </div>
        </div>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-800 transition-all duration-300 transform hover:scale-105"
        >
          Sort Another Item
        </button>
      </div>
    </div>
  );
};

export default ResultCard;
