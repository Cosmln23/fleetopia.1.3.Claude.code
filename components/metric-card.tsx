
'use client';

import { LucideIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  animate?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  trendValue,
  animate = false,
  className = ''
}: MetricCardProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    if (animate && typeof value === 'number') {
      let start = 0;
      const end = value;
      const duration = 2000; // 2 seconds
      const increment = end / (duration / 16); // 60fps

      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayValue(end);
          clearInterval(timer);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(timer);
    }
  }, [value, animate]);

  const getTrendColor = () => {
    switch (trend) {
      case 'up': return 'text-green-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className={`metric-card rounded-lg p-6 transition-all duration-500 ${
      isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    } ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-green-400/10 rounded-lg">
            <Icon className="w-5 h-5 text-green-400" />
          </div>
          <h3 className="text-sm font-light text-gray-300 matrix-text">
            {title}
          </h3>
        </div>
        {trend !== 'neutral' && trendValue && (
          <div className={`flex items-center space-x-1 text-xs ${getTrendColor()}`}>
            <span>{getTrendIcon()}</span>
            <span>{trendValue}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="text-2xl font-light text-white matrix-text">
          {animate && typeof value === 'number' ? displayValue.toLocaleString() : value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-400">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}
