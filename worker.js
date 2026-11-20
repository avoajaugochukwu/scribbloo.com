// Cloudflare Worker entry: one 308 from any non-canonical host (www, *.workers.dev)
// to DOMAIN, then hand off to the OpenNext handler (.open-next/ is made by `npm run cf:build`).
// Draft-mode (preview) responses get noindex + no-store here, so one place covers every route.
// Not in proxy.ts: Node middleware is experimental on OpenNext and next.config host redirects misfire.
import handler from "./.open-next/worker.js";
import { DOMAIN } from "./lib/site";

const LOCAL = new Set(["localhost", "127.0.0.1"]);

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.hostname !== DOMAIN && !LOCAL.has(url.hostname)) {
      url.protocol = "https:";
      url.hostname = DOMAIN;
      url.port = "";
      return Response.redirect(url.toString(), 308);
    }
    const response = await handler.fetch(request, env, ctx);
    if (!(request.headers.get("cookie") ?? "").includes("__prerender_bypass=")) return response;
    const draft = new Response(response.body, response);
    draft.headers.set("X-Robots-Tag", "noindex, nofollow");
    draft.headers.set("Cache-Control", "private, no-store");
    return draft;
  },
};

export default worker;
