'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Filter } from 'lucide-react';

interface CargoDateFilterProps {
  onDateSelect: (value: string) => void;
}

export default function CargoDateFilter({ onDateSelect }: CargoDateFilterProps) {
  const [selected, setSelected] = useState('3days');

  const handleChange = (val: string) => {
    setSelected(val);
    let date = new Date();
    
    if (val === 'today') {
      date.setHours(23, 59, 59, 999);
    } else if (val === 'tomorrow') {
      date.setDate(date.getDate() + 1);
      date.setHours(23, 59, 59, 999);
    } else { // 3days
      date.setDate(date.getDate() + 3);
      date.setHours(23, 59, 59, 999);
    }
    
    onDateSelect(date.toISOString());
  };

  const getButtonStyles = (buttonType: string) => {
    const isSelected = selected === buttonType;
    return `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
      isSelected 
        ? 'bg-blue-600 text-white shadow-lg transform scale-105' 
        : 'bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white'
    }`;
  };

  const getFilterLabel = () => {
    switch (selected) {
      case 'today': return 'Cargo available today';
      case 'tomorrow': return 'Cargo available tomorrow';
      case '3days': return 'Cargo next 3 days';
      default: return 'Filter cargo';
    }
  };

  return (
    <Card className="bg-[--card] h-full wave-hover">
      <CardContent className="p-6 h-full flex flex-col relative z-10">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-400" />
          📅 Cargo Date Filter
        </h3>

        {/* Filter Status */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg shadow-sm">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-gray-300">{getFilterLabel()}</span>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-col space-y-3 mb-4">
          <button
            onClick={() => handleChange('today')}
            className={getButtonStyles('today')}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔘</span>
              <span>Today</span>
              <span className="text-xs opacity-75">(until 23:59)</span>
            </div>
          </button>
          
          <button
            onClick={() => handleChange('tomorrow')}
            className={getButtonStyles('tomorrow')}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔘</span>
              <span>Tomorrow</span>
              <span className="text-xs opacity-75">(next 24h)</span>
            </div>
          </button>
          
          <button
            onClick={() => handleChange('3days')}
            className={getButtonStyles('3days')}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔘</span>
              <span>3 Days</span>
              <span className="text-xs opacity-75">(next 72h)</span>
            </div>
          </button>
        </div>

        {/* Filter Info */}
        <div className="mt-auto">
          <div className="bg-blue-900/20 shadow-sm rounded-lg p-3">
            <div className="text-xs text-blue-300 text-center">
              ✨ Filter applies automatically to cargo offers
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Real-time updates in AI Suggestions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}