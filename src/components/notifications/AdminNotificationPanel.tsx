import { useState } from 'react';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuth } from '../../contexts/AuthContext';

const AdminNotificationPanel = () => {
  const { addNotification } = useNotifications();
  const { isAdmin } = useAuth();
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    type: 'info' as const
  });

  if (!isAdmin()) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notification.title.trim() || !notification.message.trim()) return;

    addNotification({
      title: notification.title,
      message: notification.message,
      type: notification.type
    });

    setNotification({
      title: '',
      message: '',
      type: 'info'
    });
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-4 w-96">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Bildirim Oluştur
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => setNotification({ ...notification, title: e.target.value })}
              placeholder="Bildirim başlığı"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
              placeholder="Bildirim mesajı"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              rows={3}
            />
          </div>
          <div>
            <select
              value={notification.type}
              onChange={(e) => setNotification({ ...notification, type: e.target.value as 'info' | 'success' | 'warning' | 'error' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
            >
              <option value="info">Bilgi</option>
              <option value="success">Başarılı</option>
              <option value="warning">Uyarı</option>
              <option value="error">Hata</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
          >
            Bildirimi Gönder
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminNotificationPanel;