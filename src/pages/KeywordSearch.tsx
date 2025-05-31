import { useState } from 'react';
import { Search, Download } from 'lucide-react';
import FormField from '../components/form/FormField';

const KeywordSearch = () => {
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Array<{
    domain: string;
    rank: number;
    metrics: { traffic: string; backlinks: number };
  }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!keyword) return;
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResults([
        {
          domain: 'example.com',
          rank: 1,
          metrics: { traffic: '10K', backlinks: 1500 }
        },
        {
          domain: 'sample.com',
          rank: 2,
          metrics: { traffic: '8K', backlinks: 1200 }
        }
      ]);
      setIsLoading(false);
    }, 1500);
  };

  const exportResults = () => {
    const csv = [
      ['Domain', 'Rank', 'Traffic', 'Backlinks'].join(','),
      ...results.map(r => [
        r.domain,
        r.rank,
        r.metrics.traffic,
        r.metrics.backlinks
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `keyword-results-${keyword}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Keyword Search</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Search and analyze keywords across multiple domains</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="max-w-xl">
          <FormField
            label="Keyword"
            name="keyword"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Enter keyword to analyze"
          />
          
          <div className="mt-4 flex space-x-4">
            <button
              onClick={handleSearch}
              disabled={isLoading || !keyword}
              className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
            >
              <Search size={18} className="mr-2" />
              Search
            </button>
            
            {results.length > 0 && (
              <button
                onClick={exportResults}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
              >
                <Download size={18} className="mr-2" />
                Export CSV
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="mt-8 animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="mt-8">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Domain</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Traffic</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Backlinks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {results.map((result, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        #{result.rank}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.domain}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.metrics.traffic}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {result.metrics.backlinks}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default KeywordSearch;