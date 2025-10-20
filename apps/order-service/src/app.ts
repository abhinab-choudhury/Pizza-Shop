import express from "express";
import morgan from "morgan";

import config from "./utils/env";
import logger from "./middleware/logger";
import router from "./routes";

const app = express();
const PORT = config.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use(router);

app.listen(PORT, () => {
  logger.info(`Order Server running at http://localhost:${PORT}`);
});
