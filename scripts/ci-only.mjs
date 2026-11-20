// Workers Builds sets WORKERS_CI=1. Shipping from a laptop is banned: push to main instead.
if (!process.env.WORKERS_CI) {
  console.error("deploy runs only in Cloudflare Workers Builds. Ship with: git push origin main");
  process.exit(1);
}
