import Koa from "koa";
import bodyParser from "koa-bodyparser";
import router from "./routes";
import logger from "./middleware/logger";
import { config } from "./utils/env";

const app = new Koa();

app.use(logger);
app.use(bodyParser());
app.use(router.routes());
app.use(router.allowedMethods());

const PORT = config.PORT;

app.listen(PORT, () => {
  console.log(`Auth Server running at http://localhost:${PORT}`);
});
