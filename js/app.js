const API_URL = 'https://script.google.com/macros/s/AKfycbwp4QRsxLj51iMbZkAlcP4OqH-3EVCcbFIqkA0sFUzAq8l9HhKnsJDADUv-WnbtEvM/exec';

async function api(action, payload = {}) {
  const res = await fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...payload })
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Respuesta inválida del servidor');
  }

  if (data.error) throw new Error(data.error);
  return data;
}
