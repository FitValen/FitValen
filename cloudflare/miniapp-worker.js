const FITVALEN_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";
const BUILD = "fullscreen-locked-v3-bc76aa2";

function enhanceHtml(html) {
  if (!html.includes("enhance-v2.css")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/enhance-v2.css?v=e7791a8"><link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"><link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"></head>',
    );
  } else {
    if (!html.includes("workout-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"></head>');
    if (!html.includes("fullscreen-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"></head>');
  }
  if (!html.includes("enhance-v2.js")) {
    html = html.replace("</body>", '<script src="/enhance-v2.js?v=90847fc"></script></body>');
  }
  if (!html.includes("workout-v2.js")) {
    html = html.replace("</body>", '<script src="/workout-v2.js?v=cfe81f1"></script></body>');
  }
  if (!html.includes("fullscreen-v1.js")) {
    html = html.replace("</body>", '<script src="/fullscreen-v1.js?v=bc76aa2"></script></body>');
  }
  return html;
}

export default {
  async fetch(request, env) {
    if (request.method === "POST") {
      const headers = new Headers();
      headers.set("content-type", request.headers.get("content-type") || "application/json");
      const initData = request.headers.get("x-telegram-init-data");
      if (initData) headers.set("x-telegram-init-data", initData);
      try {
        const response = await fetch(FITVALEN_API, { method: "POST", headers, body: request.body });
        const responseHeaders = new Headers(response.headers);
        responseHeaders.set("cache-control", "no-store");
        responseHeaders.set("x-fitvalen-build", BUILD);
        responseHeaders.delete("content-length");
        return new Response(response.body, { status: response.status, headers: responseHeaders });
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
      if (request.method === "HEAD") return new Response(null, { status: response.status, headers });
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return new Response(response.body, { status: response.status, headers });
      headers.set("content-type", "text/html; charset=utf-8");
      return new Response(enhanceHtml(await response.text()), { status: response.status, headers });
    }
    return new Response("Method Not Allowed", { status: 405, headers: { allow: "GET, HEAD, POST", "x-fitvalen-build": BUILD } });
  },
};
