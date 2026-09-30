import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const PUBLIC_VAPID_KEY = 'BPoBpPATg43IoQsxy1BMczSlDYZzKSql796nng08Fy_xuelVK4bYllynpyTdoCqCV7jJ7U5d90OOtuDeOr2OTxk';

function urlBase64ToUint8Array(base64String: string) {
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
}

export const usePushNotifications = () => {
  const { token } = useAuthStore();
  const [permission, setPermission] = useState<NotificationPermission>(Notification.permission);

  const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.warn('Push messaging is not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        const convertedVapidKey = urlBase64ToUint8Array(PUBLIC_VAPID_KEY);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      }

      // Send subscription to backend
      await axios.post(
        'http://localhost:8080/api/notifications/subscribe',
        subscription,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      console.log('Successfully subscribed to push notifications');
    } catch (err) {
      console.error('Failed to subscribe to push notifications:', err);
    }
  };

  const requestPermission = () => {
    if (Notification.permission === 'default') {
      Notification.requestPermission().then(perm => {
        setPermission(perm);
        if (perm === 'granted') {
          subscribeToPush();
        }
      });
    }
  };

  useEffect(() => {
    if (!token) return;

    if (Notification.permission === 'granted') {
      subscribeToPush();
    }
  }, [token]);

  return { permission, requestPermission };
};
