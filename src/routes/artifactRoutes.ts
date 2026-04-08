import express from "express";
import ArtifactController from "../controllers/ArtifactController.js";

const router = express.Router();

// GET /api/artifacts
router.get("/", ArtifactController.getAll);

// GET /api/artifacts/:id
router.get("/:id", ArtifactController.getById);

// POST /api/artifacts
router.post("/", ArtifactController.create);

// PUT /api/artifacts/:id
router.put("/:id", ArtifactController.update);

// DELETE /api/artifacts/:id
router.delete("/:id", ArtifactController.delete);

export default router;
