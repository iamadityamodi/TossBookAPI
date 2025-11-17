import express from "express";
import multer from "multer";
import mysql from "mysql2/promise";
import bodyParser from "body-parser";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// View engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static folder
app.use("/upload", express.static(path.join(__dirname, "upload")));

// Routes
import goldRoutes from "./routes/tossbookroute.js";
app.use("/api/v1/tossbook", goldRoutes);

// Test route
app.get("/get", (req, res) => {
  res.status(200).send("<h1>Working fine now</h1>");
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
