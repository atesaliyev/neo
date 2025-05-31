import { Clock } from 'lucide-react';

interface Activity {
  id: number;
  action: string;
  timestamp: string;
  status: 'success' | 'error' | 'pending';
}

interface RecentActivitiesProps {
  isLoading: boolean;
}

const RecentActivities = ({ isLoading }: RecentActivitiesProps) => {
  const activities: Activity[] = [
    { id: 1, action: "Form filled at example.com/login", timestamp: "2 minutes ago", status: "success" },
    { id: 2, action: "Captcha solved for contact form", timestamp: "15 minutes ago", status: "success" },
    { id: 3, action: "Form submission failed", timestamp: "32 minutes ago", status: "error" },
    { id: 4, action: "Account verification completed", timestamp: "1 hour ago", status: "success" },
    { id: 5, action: "Form processing", timestamp: "1 hour ago", status: "pending" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">Recent Activities</h3>
      
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="flex items-start space-x-3">
              <div className="h-3 w-3 rounded-full bg-gray-200 dark:bg-gray-700 mt-1"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start group hover:bg-gray-50 dark:hover:bg-gray-700/50 -mx-6 px-6 py-2 transition-colors rounded-lg">
              <div className={`h-3 w-3 rounded-full ${getStatusColor(activity.status)} mt-1.5 mr-3 group-hover:scale-110 transition-transform`}></div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800 dark:text-white">{activity.action}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center mt-1">
                  <Clock size={12} className="mr-1" />
                  {activity.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <a 
          href="#all-activities" 
          className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
        >
          View all activities
        </a>
      </div>
    </div>
  );
};

export default RecentActivities;