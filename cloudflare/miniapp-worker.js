const FITVALEN_API = "https://hhlxdzehiapvolyptfth.supabase.co/functions/v1/fitvalen-miniapp";

function patchHtml(html) {
  html = html.replace(
    "d.foods.forEach(x=>(grouped[x.meal_slot||'otros']??=[]).push(x));",
    "d.foods.forEach(x=>{const k=x.meal_slot||'otros';if(!grouped[k])grouped[k]=[];grouped[k].push(x)});",
  );

  const diagnostics = `<script>
window.addEventListener('error',function(e){
  var s=document.getElementById('status');
  var h=document.getElementById('home');
  if(s)s.textContent='Error al iniciar';
  if(h)h.innerHTML='<div class="card"><b>No se pudo iniciar FitValen.</b><div class="small" style="margin-top:8px">'+String(e&&e.message?e.message:'Error JavaScript')+'</div></div>';
});
window.addEventListener('unhandledrejection',function(e){
  var s=document.getElementById('status');
  var h=document.getElementById('home');
  var r=e&&e.reason;
  if(s)s.textContent='Error de conexión';
  if(h)h.innerHTML='<div class="card"><b>No se pudo conectar.</b><div class="small" style="margin-top:8px">'+String(r&&r.message?r.message:r||'Error')+'</div></div>';
});
</script>`;

  return html.replace("<script>\n(()=>{", diagnostics + "\n<script>\n(()=>{");
}

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
        responseHeaders.delete("content-length");

        return new Response(response.body, {
          status: response.status,
          headers: responseHeaders,
        });
      } catch (error) {
        return Response.json(
          { ok: false, error: "proxy_error", reason: String(error) },
          { status: 502, headers: { "cache-control": "no-store" } },
        );
      }
    }

    if (request.method === "GET" || request.method === "HEAD") {
      const response = await env.ASSETS.fetch(request);
      if (request.method === "HEAD") return response;

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("text/html")) return response;

      const html = patchHtml(await response.text());
      const headers = new Headers(response.headers);
      headers.set("content-type", "text/html; charset=utf-8");
      headers.set("cache-control", "no-store, no-cache, must-revalidate");
      headers.delete("content-length");

      return new Response(html, { status: response.status, headers });
    }

    return new Response("Method Not Allowed", {
      status: 405,
      headers: { allow: "GET, HEAD, POST" },
    });
  },
};
