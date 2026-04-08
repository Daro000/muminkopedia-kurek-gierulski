import express from "express";
import CharacterController from "../controllers/CharacterController.js";

const router = express.Router();

// GET /api/characters
router.get("/", CharacterController.getAll);

// GET /api/characters/:id
router.get("/:id", CharacterController.getById);

// POST /api/characters
router.post("/", CharacterController.create);

// PUT /api/characters/:id
router.put("/:id", CharacterController.update);

// DELETE /api/characters/:id
router.delete("/:id", CharacterController.delete);

export default router;
