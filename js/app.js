const API_URL = 'https://script.google.com/macros/s/AKfycbxKbVh1ptbIagksA5eSxa9Jnra61xkOIMCojKFCOokvLqcdyRFeTjEbfenyvBzBm8k/exec';
const VAPID_PUBLIC_KEY = 'BFuZVf-LVmWBDS76oBlDcRPlgwuQMkUvEfh3I5EDl4XH7H3kYWzWMAvk4-8-xYZt61IjaxDgiCMmzq23qUycCg4';


async function api(action, payload = {}) {
  const params = new URLSearchParams();
  params.append('action', action);
  params.append('payload', JSON.stringify(payload));

  const res = await fetch(API_URL, {
    method: 'POST',
    body: params
  });

  const text = await res.text();
  const json = JSON.parse(text);

  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}

async function activarNotificaciones() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    alert('Notificaciones no soportadas');
    return;
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    alert('Permiso denegado');
    return;
  }

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: 'BFuZVf-LVmWBDS76oBlDcRPlgwuQMkUvEfh3I5EDl4XH7H3kYWzWMAvk4-8-xYZt61IjaxDgiCMmzq23qUycCg4'
  });

  console.log('SUBSCRIPCIÓN PUSH:', JSON.stringify(subscription));

  // 👉 AQUÍ la mandas a Sheets o a tu backend
}

async function activarNotificacionesPush() {
  if (!('serviceWorker' in navigator)) {
    alert('Service Worker no soportado');
    return;
  }

  if (!('PushManager' in window)) {
    alert('Push no soportado');
    return;
  }

  const permiso = await Notification.requestPermission();
  if (permiso !== 'granted') {
    alert('Permiso de notificaciones rechazado');
    return;
  }

  const reg = await navigator.serviceWorker.ready;

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  });

  console.log('SUBSCRIPCIÓN PUSH:', subscription);

  // 🔽 aquí la mandaremos a Google Sheets
  await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'guardarPushSubscription',
      email: SESION.email,
      subscription
    })
});



}
