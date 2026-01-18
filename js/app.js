const API_URL = 'https://script.google.com/macros/s/AKfycbxKbVh1ptbIagksA5eSxa9Jnra61xkOIMCojKFCOokvLqcdyRFeTjEbfenyvBzBm8k/exec';

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
