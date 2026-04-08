import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import characterRoutes from "./routes/characterRoutes.js";
import artifactRoutes from "./routes/artifactRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
    res.json({ message: "API Express + TypeScript działa!" });
});

app.use("/api/characters", characterRoutes);
app.use("/api/artifacts", artifactRoutes);

export default app;