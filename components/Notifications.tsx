
import React from 'react';

const WarningIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
    </svg>
);

const ErrorIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
    </svg>
);


const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
);


interface Notification {
  id: string;
  message: string;
  type: 'warning' | 'error';
}

interface NotificationsProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const typeStyles = {
  warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
  error: 'bg-red-50 border-red-400 text-red-800',
};

const iconStyles = {
  warning: 'text-yellow-500',
  error: 'text-red-500',
};

const Notifications: React.FC<NotificationsProps> = ({ notifications, onDismiss }) => {
  if (!notifications || notifications.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 mb-6">
      {notifications.map(notification => (
        <div key={notification.id} className={`p-4 border-l-4 rounded-md flex items-center justify-between ${typeStyles[notification.type]}`} role="alert">
          <div className="flex items-center">
            {notification.type === 'warning' ? <WarningIcon className={`w-6 h-6 mr-3 ${iconStyles.warning}`} /> : <ErrorIcon className={`w-6 h-6 mr-3 ${iconStyles.error}`} />}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => onDismiss(notification.id)} className="text-gray-500 hover:text-gray-700" aria-label="Dispensar notificação">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default Notifications;
