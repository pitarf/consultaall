"use client";

import { useState, useEffect } from 'react';
import { Bell, BellOff, BellRing } from 'lucide-react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushNotificationManager() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriptionState, setSubscriptionState] = useState<PushSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      registerServiceWorker();
    } else {
      setIsLoading(false);
    }
  }, []);

  async function registerServiceWorker() {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
      setSubscriptionState(subscription);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function unsubscribeFromPush() {
    setIsLoading(true);
    try {
      if (subscriptionState) {
        // Envia o endpoint para o backend excluir do banco
        await fetch('/api/push/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscriptionState.endpoint }),
        });

        // Cancela a inscrição no navegador
        await subscriptionState.unsubscribe();
      }
      setIsSubscribed(false);
      setSubscriptionState(null);
      toast.info('Notificações de vendas desativadas.');
    } catch (error) {
      console.error('Failed to unsubscribe:', error);
      toast.error('Erro ao desativar notificações.');
    } finally {
      setIsLoading(false);
    }
  }

  async function subscribeToPush() {
    setIsLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Permissão para notificações foi negada.');
        setIsLoading(false);
        return;
      }

      const registration = await navigator.serviceWorker.ready;
      
      const response = await fetch('/api/push/vapidPublicKey');
      const vapidPublicKey = await response.text();

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      setIsSubscribed(true);
      setSubscriptionState(subscription);
      toast.success('Notificações de vendas ativadas neste dispositivo!');
      
      new Notification('ConsultAll Admin', {
        body: 'Você receberá avisos de recarga neste dispositivo.',
        icon: '/logo.webp'
      });

    } catch (error) {
      console.error('Failed to subscribe:', error);
      toast.error('Erro ao ativar notificações. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  const toggleSubscription = () => {
    if (isSubscribed) {
      unsubscribeFromPush();
    } else {
      subscribeToPush();
    }
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={toggleSubscription}
      disabled={isLoading}
      title={isSubscribed ? "Desativar Notificações" : "Ativar Notificações de Venda"}
      className={`p-2 rounded-xl transition-all border ${
        isSubscribed 
          ? 'bg-blue-500/10 border-blue-500/20 text-blue-500 dark:bg-blue-500/20 dark:text-blue-400' 
          : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-400 dark:hover:text-white dark:hover:bg-white/10'
      } shadow-sm`}
    >
      {isLoading ? (
        <Bell className="w-4 h-4 animate-pulse opacity-50" />
      ) : isSubscribed ? (
        <BellRing className="w-4 h-4" />
      ) : (
        <BellOff className="w-4 h-4" />
      )}
    </button>
  );
}
