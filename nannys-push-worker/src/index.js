export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ✅ Health check
    if (url.pathname === "/") {
      return new Response("Push API activa", {
        headers: { "content-type": "text/plain" }
      });
    }

    // ✅ Test simple (para navegador)
    if (url.pathname === "/test") {
      return new Response("test ok", {
        headers: { "content-type": "text/plain" }
      });
    }

    // ❌ Todo lo demás
    return new Response("Not found", { status: 404 });
  }
};
