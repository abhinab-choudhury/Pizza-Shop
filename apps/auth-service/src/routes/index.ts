import Router from "koa-router";

const router = new Router();

router.get("/", async (ctx) => {
  ctx.body = { message: "Auth Server - Koa.js + TypeScript" };
});

export default router;
