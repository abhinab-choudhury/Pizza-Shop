import Koa from "koa";
import bodyParser from "koa-bodyparser";
import authRoutes from "./routes/auth";
import errorHandler from "./middleware/error-handler";
import logger from "./middleware/logger";
import { config } from "./utils/env";

const app = new Koa();

app.use(errorHandler);
app.use(logger);
app.use(bodyParser());
app.use(authRoutes.routes());
app.use(authRoutes.allowedMethods());

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(
    `Auth Service running at http://localhost:${PORT}`,
  );
});
