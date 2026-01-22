const API_URL = 'https://script.google.com/macros/s/AKfycbxKbVh1ptbIagksA5eSxa9Jnra61xkOIMCojKFCOokvLqcdyRFeTjEbfenyvBzBm8k/exec';
const VAPID_PUBLIC_KEY = 'BFuZVf-LVmWBDS76oBlDcRPlgwuQMkUvEfh3I5EDl4XH7H3kYWzWMAvk4-8-xYZt61IjaxDgiCMmzq23qUycCg4';

/**
 * Función genérica para interactuar con el backend GAS
 */
async function api(action, payload = {}) {
  const params = new URLSearchParams();
  params.append('action', action);
  params.append('payload', JSON.stringify(payload));

  const res = await fetch(API_URL, {
    method: 'POST',
    body: params
  });

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    throw new Error('Respuesta no válida del servidor: ' + text.substring(0, 50));
  }

  if (!json.ok) throw new Error(json.error || 'Error desconocido');
  return json.data;
}
