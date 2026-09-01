const SUPABASE_MINIAPP_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const headers = new Headers();
      const contentType = request.headers.get("content-type");
      const initData = request.headers.get("x-telegram-init-data");
      if (contentType) headers.set("content-type", contentType);
      if (initData) headers.set("x-telegram-init-data", initData);

      return fetch(SUPABASE_MINIAPP_API, {
        method: "POST",
        headers,
        body: request.body,
      });
    }

    if (request.method === "GET" || request.method === "HEAD") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Method Not Allowed", { status: 405 });
  },
};
