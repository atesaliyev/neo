import { ArrowUp, ArrowDown, DivideIcon as LucideIcon } from 'lucide-react';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: ReactNode;
  color: string;
  isLoading: boolean;
}

const DashboardCard = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  color,
  isLoading 
}: DashboardCardProps) => {
  return (
    <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all duration-300 hover:shadow-lg group">
      <div className="absolute right-0 top-0 -mt-4 -mr-4 h-24 w-24 rounded-full opacity-20 group-hover:opacity-30 transition-opacity duration-300" style={{ background: color }}></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
          <div className={`${color} p-2 rounded-lg text-white shadow-sm`}>
            {icon}
          </div>
        </div>
        
        {isLoading ? (
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2"></div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
          </div>
        ) : (
          <>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mb-2">{value}</p>
            <div className="flex items-center text-sm">
              {trend === 'up' && (
                <span className="text-green-500 flex items-center font-medium mr-1">
                  <ArrowUp size={16} className="mr-1" />
                  {change}
                </span>
              )}
              {trend === 'down' && (
                <span className="text-red-500 flex items-center font-medium mr-1">
                  <ArrowDown size={16} className="mr-1" />
                  {change}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">from last period</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardCard;