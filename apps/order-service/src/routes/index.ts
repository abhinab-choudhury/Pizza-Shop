import express, { type Router } from "express";

import { renderLandingPage } from "../landing";

const router: Router = express.Router();

router.get("/", (_req, res) => {
  res.type("html").send(renderLandingPage("Order"));
});

export default router;
