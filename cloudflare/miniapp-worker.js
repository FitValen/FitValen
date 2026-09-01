const FITVALEN_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";
const BUILD = "ui-917e2b62";

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const headers = new Headers();
      headers.set("content-type", request.headers.get("content-type") || "application/json");

      const initData = request.headers.get("x-telegram-init-data");
      if (initData) headers.set("x-telegram-init-data", initData);

      try {
        const response = await fetch(FITVALEN_API, {
          method: "POST",
          headers,
          body: request.body,
        });

        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("cache-control", "no-store");
        responseHeaders.set("x-fitvalen-build", BUILD);
        responseHeaders.delete("content-length");

        return new Response(response.body, {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (error) {
        return Response.json(
          { ok: false, error: "proxy_error", reason: String(error) },
          { status: 502, headers: { "cache-control": "no-store", "x-fitvalen-build": BUILD } },
        );
      }
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const response = await env.ASSETS.fetch(request);
      const headers = new Headers(response.headers);
      headers.set("x-fitvalen-build", BUILD);
      headers.set("cache-control", "no-store, no-cache, must-revalidate");
      headers.delete("content-length");

      return new Response(request.method === "HEAD" ? null : response.body, {
        status: response.status,
        headers,
      });
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, POST", "x-fitvalen-build": BUILD },
    });
  },
};