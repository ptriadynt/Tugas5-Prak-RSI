import "dotenv/config";
import express, { type Application } from "express";
import { sql } from "drizzle-orm";
import swaggerUi from "swagger-ui-express";
import { getDb } from "./db/index.ts";
import { stallRouter } from "./routes/stallRouter.ts";
import { authRouter } from "./routes/authRouter.ts";
import { userRouter } from "./routes/userRouter.ts";
import { menuItemRouter } from "./routes/menuItemRouter.ts";
import { auditRouter } from "./routes/auditRouter.ts";
import { notFoundHandler } from "./middlewares/notfound.ts";
import { errorHandler } from "./middlewares/errorHandler.ts";
import { openApiDocument } from "./docs/openapi.ts";

const app: Application = express();
const PORT = Number(process.env.PORT ?? 3000);

// Middleware CORS agar frontend React dapat mengakses backend
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/health", async (_req, res) => {
  const db = await getDb();
  await db.execute(sql`SELECT 1 AS ok`);
  res.status(200).json({ status: "success", message: "Server dan database terhubung" });
});

// Routing API (mendukung prefix /api, /api/v1 maupun direct root)
app.use("/api/v1/stalls", stallRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/menus", menuItemRouter);
app.use("/api/v1/audit-logs", auditRouter);

app.use("/api/audit-logs", auditRouter);

app.use("/stalls", stallRouter);
app.use("/auth", authRouter);
app.use("/users", userRouter);
app.use("/menus", menuItemRouter);
app.use("/audit-logs", auditRouter);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
  console.log(`Dokumentasi API: http://localhost:${PORT}/docs`);
});
