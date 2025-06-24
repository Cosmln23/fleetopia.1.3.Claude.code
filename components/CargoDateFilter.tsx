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
      case 'today': return 'Cargo disponibil astăzi';
      case 'tomorrow': return 'Cargo disponibil mâine';
      case '3days': return 'Cargo următoarele 3 zile';
      default: return 'Filtrează cargo';
    }
  };

  return (
    <Card className="bg-slate-800 border-blue-800/30 h-full">
      <CardContent className="p-6 h-full flex flex-col">
        <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
          <Filter className="w-5 h-5 mr-2 text-blue-400" />
          📅 Cargo Date Filter
        </h3>

        {/* Filter Status */}
        <div className="mb-4 p-3 bg-slate-700/50 rounded-lg border border-blue-800/20">
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
              <span>Azi</span>
              <span className="text-xs opacity-75">(până la 23:59)</span>
            </div>
          </button>
          
          <button
            onClick={() => handleChange('tomorrow')}
            className={getButtonStyles('tomorrow')}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔘</span>
              <span>Mâine</span>
              <span className="text-xs opacity-75">(24h următoare)</span>
            </div>
          </button>
          
          <button
            onClick={() => handleChange('3days')}
            className={getButtonStyles('3days')}
          >
            <div className="flex items-center justify-center space-x-2">
              <span>🔘</span>
              <span>În 3 Zile</span>
              <span className="text-xs opacity-75">(72h următoare)</span>
            </div>
          </button>
        </div>

        {/* Filter Info */}
        <div className="mt-auto">
          <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3">
            <div className="text-xs text-blue-300 text-center">
              ✨ Filtrul se aplică automat la cargo offers
            </div>
            <div className="text-xs text-gray-400 text-center mt-1">
              Updates real-time în AI Suggestions
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}