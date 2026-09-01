const FITVALEN_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const headers = new Headers();
      headers.set("content-type", request.headers.get("content-type") || "application/json");

      const initData = request.headers.get("x-telegram-init-data");
      if (initData) headers.set("x-telegram-init-data", initData);

      const response = await fetch(FITVALEN_API, {
        method: "POST",
        headers,
        body: request.body,
      });

      const responseHeaders = new Headers(response.headers);
      responseHeaders.set("cache-control", "no-store");
      responseHeaders.delete("content-length");

      return new Response(response.body, {
        status: response.status,
        headers: responseHeaders,
      });
    }

    if (request.method === "GET" || request.method === "HEAD") {
      return env.ASSETS.fetch(request);
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, POST" },
    });
  },
};
