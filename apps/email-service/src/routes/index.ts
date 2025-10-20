import express, { type Router } from "express";

const router: Router = express.Router();

router.get("/", (_req, res) => {
  res.json({ message: "Email Server - Express.js" });
});

export default router;
