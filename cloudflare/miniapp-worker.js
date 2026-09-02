const CORE_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";
const ADVANCED_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp-v7";
const MANUAL_FOOD_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp-manual-food";
const BUILD = "advanced-v1-d11dddb";
const ADVANCED_ACTIONS = new Set([
  "workout_extras","edit_set","set_exercise_note","set_workout_note","add_cardio","delete_cardio",
  "products","add_food","edit_food","delete_food","diet_free_day","full_free_day","reopen_diet",
  "day_summary","finish_day","progress_v2"
]);

function enhanceHtml(html) {
  if (!html.includes("enhance-v2.css")) {
    html = html.replace(
      "</head>",
      '<link rel="stylesheet" href="/enhance-v2.css?v=e7791a8"><link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"><link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"><link rel="stylesheet" href="/advanced-v1.css?v=d11dddb"></head>',
    );
  } else {
    if (!html.includes("workout-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/workout-v1.css?v=fb0cc79"></head>');
    if (!html.includes("fullscreen-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/fullscreen-v1.css?v=3bd38c8"></head>');
    if (!html.includes("advanced-v1.css")) html = html.replace("</head>", '<link rel="stylesheet" href="/advanced-v1.css?v=d11dddb"></head>');
  }
  if (!html.includes("enhance-v2.js")) html = html.replace("</body>", '<script src="/enhance-v2.js?v=396d91c"></script></body>');
  if (!html.includes("workout-v2.js")) html = html.replace("</body>", '<script src="/workout-v2.js?v=cfe81f1"></script></body>');
  if (!html.includes("advanced-v1.js")) html = html.replace("</body>", '<script src="/advanced-v1.js?v=b2fc32e"></script></body>');
  if (!html.includes("advanced-guards-v1.js")) html = html.replace("</body>", '<script src="/advanced-guards-v1.js?v=3bff704"></script></body>');
  if (!html.includes("manual-food-validation-v1.js")) html = html.replace("</body>", '<script src="/manual-food-validation-v1.js?v=8fd68c6"></script></body>');
  if (!html.includes("auto-day-v1.js")) html = html.replace("</body>", '<script src="/auto-day-v1.js?v=df4eb38"></script></body>');
  if (!html.includes("fullscreen-v1.js")) html = html.replace("</body>", '<script src="/fullscreen-v1.js?v=452c0f7"></script></body>');
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
        const bodyText = await request.text();
        let action = "";
        try { action = String(JSON.parse(bodyText)?.action || ""); } catch (_) {}
        const target = action === "add_manual_food" ? MANUAL_FOOD_API : (ADVANCED_ACTIONS.has(action) ? ADVANCED_API : CORE_API);
        const response = await fetch(target, { method: "POST", headers, body: bodyText });
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
