import { useState, useEffect } from 'react';
import { Bell, Check, Trash2, X, Plus } from 'lucide-react';
import { useNotifications, Notification } from '../../contexts/NotificationContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useAuth } from '../../contexts/AuthContext';

interface NotificationPanelProps {
  hasUserInteracted: boolean;
}

const NotificationPanel = ({ hasUserInteracted }: NotificationPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info' as Notification['type']
  });
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification, addNotification } = useNotifications();
  const { isAdmin } = useAuth();
  const [showSlideNotification, setShowSlideNotification] = useState(false);
  const [currentSlideNotification, setCurrentSlideNotification] = useState<Notification | null>(null);

  useEffect(() => {
    const audio = new Audio('/notification.mp3');

    const handleNewNotification = async (notification: Notification) => {
      setCurrentSlideNotification(notification);
      setShowSlideNotification(true);
      
      if (hasUserInteracted) {
        try {
          await audio.play();
        } catch (error) {
          console.error('Failed to play notification sound:', error);
        }
      }

      setTimeout(() => {
        setShowSlideNotification(false);
        setCurrentSlideNotification(null);
      }, 5000);
    };

    const latestNotification = notifications[0];
    if (latestNotification && !latestNotification.read) {
      handleNewNotification(latestNotification);
    }
  }, [notifications, hasUserInteracted]);

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Check className="text-green-500\" size={18} />;
      case 'error':
        return <X className="text-red-500" size={18} />;
      case 'warning':
        return <Bell className="text-yellow-500" size={18} />;
      default:
        return <Bell className="text-blue-500" size={18} />;
    }
  };

  const handleCreateNotification = () => {
    if (!newNotification.title.trim() || !newNotification.message.trim()) return;

    addNotification({
      title: newNotification.title,
      message: newNotification.message,
      type: newNotification.type
    });

    setNewNotification({
      title: '',
      message: '',
      type: 'info'
    });
    setShowCreateForm(false);
  };

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Bildirimler</h3>
              <div className="flex items-center space-x-4">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    Tümünü okundu işaretle
                  </button>
                )}
                {isAdmin() && (
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                  >
                    <Plus size={20} />
                  </button>
                )}
              </div>
            </div>

            {showCreateForm && (
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Bildirim başlığı"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  />
                  <textarea
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Bildirim mesajı"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    rows={3}
                  />
                  <select
                    value={newNotification.type}
                    onChange={(e) => setNewNotification({ ...newNotification, type: e.target.value as Notification['type'] })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="info">Bilgi</option>
                    <option value="success">Başarılı</option>
                    <option value="warning">Uyarı</option>
                    <option value="error">Hata</option>
                  </select>
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleCreateNotification}
                      className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600"
                    >
                      Gönder
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  Bildirim bulunmuyor
                </div>
              ) : (
                notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                      !notification.read ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="ml-3 flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {notification.message}
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                          {format(new Date(notification.createdAt), 'dd MMMM yyyy HH:mm', { locale: tr })}
                        </p>
                      </div>
                      <div className="ml-3 flex-shrink-0 flex items-center space-x-2">
                        {!notification.read && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => removeNotification(notification.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sliding Notification */}
      {showSlideNotification && currentSlideNotification && (
        <div className="fixed top-4 right-4 z-50 animate-slideIn">
          <div className={`p-4 rounded-lg shadow-lg border ${
            currentSlideNotification.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' :
            currentSlideNotification.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800' :
            currentSlideNotification.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800' :
            'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
          }`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {getNotificationIcon(currentSlideNotification.type)}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {currentSlideNotification.title}
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {currentSlideNotification.message}
                </p>
              </div>
              <button
                onClick={() => setShowSlideNotification(false)}
                className="ml-4 text-gray-400 hover:text-gray-500"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NotificationPanel;