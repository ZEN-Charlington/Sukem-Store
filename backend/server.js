import express from "express";
import dotenv from "dotenv";
import authenRoutes from "./routes/authen.route.js";
import auditRoutes from "./routes/audit.route.js";
import hoadonRoutes from "./routes/hoadon.route.js";
import bodyParser from 'body-parser';
import cors from "cors";

import { connectDB } from "./config/db.js";

import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());  // Phân tích JSON trong body của request

app.use(bodyParser.urlencoded({ extended: true }));  // Để phân tích dữ liệu URL-encoded (nếu cần)

app.use(express.json()); // này để nhận file Json nhé

app.use(cors());

app.use("/api/auditlogs", auditRoutes);

app.use("/api/authen", authenRoutes);

app.use("/api/invoices", hoadonRoutes)

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
    connectDB();
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});