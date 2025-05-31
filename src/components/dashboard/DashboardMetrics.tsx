interface MetricItem {
  label: string;
  value: string;
  percentage: number;
}

interface DashboardMetricsProps {
  title: string;
  data: MetricItem[];
  isLoading: boolean;
}

const DashboardMetrics = ({ title, data, isLoading }: DashboardMetricsProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-6">{title}</h3>
      
      {isLoading ? (
        <div className="space-y-6 animate-pulse">
          {[1, 2, 3].map((item) => (
            <div key={item} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-12"></div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {data.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{item.label}</span>
                <span className="text-sm font-bold text-gray-800 dark:text-white">{item.value}</span>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900">
                      {item.percentage}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardMetrics;