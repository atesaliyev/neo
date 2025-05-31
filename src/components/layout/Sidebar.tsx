import { NavLink } from 'react-router-dom';
import { Home, Globe, Settings, Users, Activity, X, Search, Bell, FolderOpen, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const Sidebar = ({ isOpen, isMobile, toggleSidebar }: SidebarProps) => {
  const { isAdmin } = useAuth();

  const menuItems = [
    {
      title: 'Ana Menü',
      items: [
        {
          name: 'Anasayfa',
          icon: <Home size={18} />,
          path: '/dashboard',
          adminOnly: false
        }
      ]
    },
    {
      title: 'Domain',
      items: [
        {
          name: 'Domainler',
          icon: <Globe size={18} />,
          path: '/domains',
          adminOnly: false
        },
        {
          name: 'Anahtar Kelimeler',
          icon: <Search size={18} />,
          path: '/keywords',
          adminOnly: false
        }
      ]
    },
    {
      title: 'Ayarlar',
      items: [
        {
          name: 'API Ayarları',
          icon: <Settings size={18} />,
          path: '/api-settings',
          adminOnly: false
        },
        {
          name: 'Dosyalar',
          icon: <FolderOpen size={18} />,
          path: '/files',
          adminOnly: false
        },
        {
          name: 'Kullanıcılar',
          icon: <Users size={18} />,
          path: '/users',
          adminOnly: true
        },
        {
          name: 'Bildirimler',
          icon: <Bell size={18} />,
          path: '/notifications',
          adminOnly: true
        }
      ]
    }
  ];

  return (
    <>
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20" 
          onClick={toggleSidebar}
        ></div>
      )}

      <aside 
        className={`
          fixed top-0 left-0 z-30 h-full w-64 transition-transform duration-300 ease-in-out overflow-y-auto
          bg-gradient-to-b from-gray-900 to-gray-800 text-white
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          ${!isMobile && 'relative'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-4 bg-gray-900/50 backdrop-blur-sm border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              DashCaptcha
            </h1>
          </div>
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-400 hover:text-white focus:outline-none"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="p-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2 px-3">
                {section.title}
              </p>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  (!item.adminOnly || (item.adminOnly && isAdmin())) && (
                    <li key={itemIdx}>
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => 
                          `flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                            isActive 
                              ? 'bg-emerald-500/20 text-emerald-400' 
                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                          }`
                        }
                        onClick={isMobile ? toggleSidebar : undefined}
                      >
                        {item.icon}
                        <span className="ml-3 font-medium">{item.name}</span>
                      </NavLink>
                    </li>
                  )
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-900/50 backdrop-blur-sm border-t border-gray-700/50">
          <div className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-white/5">
            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <User size={16} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-400">admin@example.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;