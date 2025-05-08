
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';

type NotificationContextType = {
  isSupported: boolean;
  permission: NotificationPermission | null;
  subscription: PushSubscription | null;
  requestPermission: () => Promise<boolean>;
  sendNotification: (title: string, options?: NotificationOptions) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [isSupported, setIsSupported] = useState<boolean>(false);
  const [permission, setPermission] = useState<NotificationPermission | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  // Check if notifications are supported
  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setIsSupported(supported);
    
    if (supported) {
      setPermission(Notification.permission);
      
      // Register service worker
      navigator.serviceWorker.register('/service-worker.js')
        .then((registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          // Check for existing push subscription
          return registration.pushManager.getSubscription();
        })
        .then((existingSubscription) => {
          setSubscription(existingSubscription);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Request notification permission
  const requestPermission = async (): Promise<boolean> => {
    if (!isSupported) {
      toast.error('Notifications are not supported in this browser.');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        const serviceWorkerReg = await navigator.serviceWorker.ready;
        
        // Get or create push subscription
        const newSubscription = await serviceWorkerReg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlB64ToUint8Array(
            // You would replace this with your actual VAPID public key
            'BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U'
          )
        });
        
        setSubscription(newSubscription);
        
        // Here you would typically send this subscription to your backend
        // saveSubscription(newSubscription);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Failed to request notification permission.');
      return false;
    }
  };

  // Send a local notification (not a push notification)
  const sendNotification = (title: string, options: NotificationOptions = {}) => {
    if (!isSupported || permission !== 'granted') {
      toast.error('Notification permission not granted.');
      return;
    }

    const defaultOptions = {
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      ...options
    };

    try {
      new Notification(title, defaultOptions);
    } catch (error) {
      console.error('Error sending notification:', error);
      toast.error('Failed to send notification.');
    }
  };

  // Helper function to convert base64 to Uint8Array for applicationServerKey
  const urlB64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  };

  return (
    <NotificationContext.Provider value={{
      isSupported,
      permission,
      subscription,
      requestPermission,
      sendNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
