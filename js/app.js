const API_URL = 'https://script.google.com/macros/s/AKfycbwp4QRsxLj51iMbZkAlcP4OqH-3EVCcbFIqkA0sFUzAq8l9HhKnsJDADUv-WnbtEvM/exec';

async function api(action, payload = {}) {
  const params = new URLSearchParams();
  params.append('action', action);
  params.append('payload', JSON.stringify(payload));

  const res = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    },
    body: params.toString()
  });

  if (!res.ok) {
    throw new Error('Error de red (' + res.status + ')');
  }

  const text = await res.text();

  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error('Respuesta no válida del servidor');
  }

  if (!json.ok) {
    throw new Error(json.error || 'Error desconocido');
  }

  return json.data;
}
