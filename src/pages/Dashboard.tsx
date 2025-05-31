import { useState, useEffect } from 'react';
import { LineChart, BarChart, PieChart, ArrowUp, ArrowDown, Clock, Globe, Shield, Search } from 'lucide-react';
import DashboardCard from '../components/dashboard/DashboardCard';
import DashboardMetrics from '../components/dashboard/DashboardMetrics';
import DashboardChart from '../components/dashboard/DashboardChart';
import RecentActivities from '../components/dashboard/RecentActivities';

const Dashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d');
  const [domainStats, setDomainStats] = useState({
    total: 0,
    blacklisted: 0,
    whitelisted: 0,
    pending: 0
  });

  useEffect(() => {
    // Load domain statistics from localStorage
    const savedDomains = localStorage.getItem('domains');
    if (savedDomains) {
      const domains = JSON.parse(savedDomains);
      setDomainStats({
        total: domains.length,
        blacklisted: domains.filter((d: any) => d.type === 'blacklist').length,
        whitelisted: domains.filter((d: any) => d.type === 'whitelist').length,
        pending: domains.filter((d: any) => !d.processed).length
      });
    }

    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const stats = {
    '7d': {
      domains: domainStats.total.toString(),
      domainsChange: '+12.5%',
      blacklisted: domainStats.blacklisted.toString(),
      blacklistedChange: '+8.3%',
      avgTime: '1.8s',
      timeChange: '-0.3s',
      pending: domainStats.pending.toString(),
      pendingChange: '-5.2%'
    },
    '30d': {
      domains: (domainStats.total * 2).toString(),
      domainsChange: '+18.2%',
      blacklisted: (domainStats.blacklisted * 2).toString(),
      blacklistedChange: '+15.8%',
      avgTime: '1.9s',
      timeChange: '-0.2s',
      pending: ((domainStats.pending || 0) * 3).toString(),
      pendingChange: '-3.8%'
    },
    '90d': {
      domains: (domainStats.total * 4).toString(),
      domainsChange: '+22.4%',
      blacklisted: (domainStats.blacklisted * 4).toString(),
      blacklistedChange: '+20.2%',
      avgTime: '2.1s',
      timeChange: '-0.4s',
      pending: ((domainStats.pending || 0) * 5).toString(),
      pendingChange: '-8.5%'
    }
  };

  const currentStats = stats[timeRange];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Gösterge Paneli</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Domain ve BTK istatistikleri</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-200 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="7d">Son 7 gün</option>
            <option value="30d">Son 30 gün</option>
            <option value="90d">Son 90 gün</option>
          </select>
          <button className="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 px-4 py-2 rounded-md text-sm font-medium hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
            Rapor İndir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Toplam Domain" 
          value={isLoading ? "-" : currentStats.domains} 
          change={currentStats.domainsChange} 
          trend="up"
          icon={<Globe size={18} />} 
          color="bg-emerald-500" 
          isLoading={isLoading}
        />
        <DashboardCard 
          title="Blacklist Domainler" 
          value={isLoading ? "-" : currentStats.blacklisted} 
          change={currentStats.blacklistedChange} 
          trend="up"
          icon={<Shield size={18} />} 
          color="bg-cyan-500" 
          isLoading={isLoading}
        />
        <DashboardCard 
          title="Ortalama İşlem Süresi" 
          value={isLoading ? "-" : currentStats.avgTime} 
          change={currentStats.timeChange} 
          trend="down"
          icon={<Clock size={18} />} 
          color="bg-blue-500" 
          isLoading={isLoading}
        />
        <DashboardCard 
          title="Bekleyen İşlemler" 
          value={isLoading ? "-" : currentStats.pending} 
          change={currentStats.pendingChange} 
          trend="down"
          icon={<Search size={18} />} 
          color="bg-red-500" 
          isLoading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Domain İşlem Aktivitesi</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Zaman içinde işlenen domainler</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 text-sm bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-md">Günlük</button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Haftalık</button>
              <button className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">Aylık</button>
            </div>
          </div>
          <DashboardChart 
            title=""
            subtitle=""
            type="line"
            isLoading={isLoading}
          />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Domain Dağılımı</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Türe göre dağılım</p>
            </div>
          </div>
          <DashboardMetrics 
            title=""
            data={[
              { label: "Blacklist", value: domainStats.blacklisted.toString(), percentage: Math.round((domainStats.blacklisted / domainStats.total) * 100) || 0 },
              { label: "Whitelist", value: domainStats.whitelisted.toString(), percentage: Math.round((domainStats.whitelisted / domainStats.total) * 100) || 0 },
              { label: "Bekleyen", value: domainStats.pending.toString(), percentage: Math.round((domainStats.pending / domainStats.total) * 100) || 0 }
            ]}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Son Aktiviteler</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Son domain işlemleri ve olaylar</p>
            </div>
            <button className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300">
              Tümünü Gör
            </button>
          </div>
          <RecentActivities isLoading={isLoading} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">BTK Form Başarı Oranı</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Form gönderim başarı oranları</p>
            </div>
          </div>
          <DashboardChart 
            title=""
            subtitle=""
            type="bar"
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;