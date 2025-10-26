import api from './api'

const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', registration)
      return registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }
  return null
}

export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications')
    return false
  }

  if (Notification.permission === 'granted') {
    return true
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  return false
}

export const subscribeToPushNotifications = async () => {
  try {
    // Request permission
    const permissionGranted = await requestNotificationPermission()
    if (!permissionGranted) {
      console.log('Notification permission denied')
      return false
    }

    // Register service worker
    const registration = await registerServiceWorker()
    if (!registration) {
      console.log('Service worker registration failed')
      return false
    }

    // Get VAPID public key from backend
    const vapidResponse = await api.get('/notifications/push/vapid-key')
    const vapidPublicKey = vapidResponse.data.public_key

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    })

    // Send subscription to backend
    await api.post('/notifications/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
        auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
      }
    })

    console.log('Push notification subscription successful')
    return true
  } catch (error) {
    console.error('Push notification subscription failed:', error)
    return false
  }
}

export const unsubscribeFromPushNotifications = async (subscriptionId) => {
  try {
    await api.delete(`/notifications/push/unsubscribe/${subscriptionId}`)

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      await subscription.unsubscribe()
    }

    console.log('Unsubscribed from push notifications')
    return true
  } catch (error) {
    console.error('Unsubscribe failed:', error)
    return false
  }
}

export const checkPushSubscription = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false
  }

  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null
  } catch (error) {
    console.error('Error checking subscription:', error)
    return false
  }
}
