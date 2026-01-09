import express from "express";
import client from "prom-client";
import gatewayAuth from "./middlewares/gatewayAuth.js";
import orderRoutes from "./routes/orderRoutes.js";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger.js";

const svc = "sf-orders";
const origLog = console.log;
const origError = console.error;
console.log = (...args) => origLog(`[${svc}]`, ...args);
console.error = (...args) => origError(`[${svc}]`, ...args);

export const app = express();
const PORT = process.env.SF_ORDERS_API_PORT;

app.use(express.json());
client.collectDefaultMetrics();

const httpHistogram = new client.Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request latency in seconds",
  labelNames: ["method", "route", "code"],
  buckets: [0.05, 0.1, 0.25, 0.5, 1, 2, 5],
});

const httpRequestsTotal = new client.Counter({
  name: "http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "code"],
});

app.use((req, res, next) => {
  const labelsBase = { method: req.method, route: req.route?.path || req.path };
  const end = httpHistogram.startTimer(labelsBase);
  res.on("finish", () => {
    const code = String(res.statusCode);
    end({ code });
    httpRequestsTotal.inc({ ...labelsBase, code });
  });
  next();
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/metrics", async (_req, res) => {
  try {
    res.set("Content-Type", client.register.contentType);
    res.end(await client.register.metrics());
  } catch (err) {
    console.error("[metrics] error", err);
    res.status(500).json({ error: "metrics_error" });
  }
});

app.use(gatewayAuth);

app.use("/orders", orderRoutes);

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Orders" });
});

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Swagger docs em http://localhost:${PORT}/`);
  });
}

export { app as ordersApp };
