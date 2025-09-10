import express from "express";
import authRoutes from "./auth";
import companyRoutes from "./company";
import contractRoutes from "./contract";
import invoiceRoutes from "./invoice";

const app = express();

app.use("/api/auth", authRoutes);
app.use("/api", invoiceRoutes);
app.use("/api", companyRoutes);
app.use("/api", contractRoutes);

export default app;
