import express, { type Router } from "express";

const router: Router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "Order Server - Express.js" });
});

export default router;
