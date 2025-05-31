import { useEffect, useRef } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

interface DashboardChartProps {
  title: string;
  subtitle: string;
  type: 'line' | 'bar';
  isLoading: boolean;
}

const DashboardChart = ({ title, subtitle, type, isLoading }: DashboardChartProps) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    if (isLoading || !chartRef.current) return;

    // In a real application, we would initialize a chart library here
    // For demo purposes, we'll just show a placeholder
  }, [isLoading, type, theme]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        
        {!isLoading && (
          <div className="mt-2 sm:mt-0">
            <select className="text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
      ) : (
        <div ref={chartRef} className="h-64 flex items-center justify-center">
          {type === 'line' && (
            <div className="w-full h-full flex items-end justify-between px-4">
              {[35, 60, 45, 70, 55, 80, 65].map((value, index) => (
                <div key={index} className="relative h-full flex flex-col items-center group">
                  <div className="absolute top-0 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium bg-gray-800 text-white px-2 py-1 rounded">
                    {value}
                  </div>
                  <div 
                    style={{ height: `${value}%` }} 
                    className="w-0.5 bg-indigo-500 rounded-t relative"
                  >
                    <div className="absolute -top-1.5 -ml-1.5 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 bg-indigo-500 shadow-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {type === 'bar' && (
            <div className="w-full h-full flex items-end justify-between px-4">
              {[75, 85, 90, 65].map((value, index) => (
                <div key={index} className="relative h-full flex flex-col items-center px-2 group">
                  <div className="absolute top-0 -mt-6 opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium bg-gray-800 text-white px-2 py-1 rounded">
                    {value}%
                  </div>
                  <div 
                    style={{ height: `${value}%` }} 
                    className="w-full bg-indigo-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                  ></div>
                  <div className="text-xs mt-2 font-medium text-gray-500 dark:text-gray-400">
                    {['Image', 'Text', 'reCAPTCHA', 'Other'][index]}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardChart;