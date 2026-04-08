import express, { Request, Response } from "express";
import { Character } from "../models/Character.js";
import CharacterService from "../services/CharacterService.js";

const router = express.Router();

const handleError = (
  res: Response,
  err: unknown,
  fallbackMessage: string,
): void => {
  if (CharacterService.isServiceError(err)) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  const error = err instanceof Error ? err : new Error("Nieznany błąd");
  res.status(500).json({ error: `${fallbackMessage}: ${error.message}` });
};

const getSingleIdParam = (id: string | string[]): string => {
  if (Array.isArray(id)) {
    return id[0] ?? "";
  }

  return id;
};

// wszystskie
router.get("/", async (req: Request, res: Response) => {
  try {
    const characters: Array<Character> = await CharacterService.findAll();
    res.json(characters);
  } catch (err) {
    handleError(res, err, "Nie udało się pobrać postaci");
  }
});

// wyswietla po id
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = getSingleIdParam(req.params.id);
    const character: Character | null = await CharacterService.findById(id);
    if (!character) {
      res.status(404).json({ error: "Nie znaleziono postaci" });
      return;
    }
    res.json(character);
  } catch (err) {
    handleError(res, err, "Nie udało się pobrać postaci");
  }
});

// post
router.post("/", async (req: Request, res: Response) => {
  try {
    const newCharacter: Character = await CharacterService.create(req.body);
    res
      .status(201)
      .json({
        message: `Dodano postać: ${newCharacter.name}`,
        character: newCharacter,
      });
  } catch (err) {
    handleError(res, err, "Nie udało się dodać postaci");
  }
});

// put
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = getSingleIdParam(req.params.id);
    const updatedCharacter: Character | null = await CharacterService.update(
      id,
      req.body,
    );
    if (!updatedCharacter) {
      res.status(404).json({ error: "Nie znaleziono postaci" });
      return;
    }
    res.json({ message: `Zaktualizowano postać`, character: updatedCharacter });
  } catch (err) {
    handleError(res, err, "Nie udało się zaktualizować postaci");
  }
});

// delete daje null jak sie usunie goscia
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = getSingleIdParam(req.params.id);
    const deletedCharacter = await CharacterService.delete(id);
    if (!deletedCharacter) {
      res.status(404).json({ error: "Nie znaleziono postaci" });
      return;
    }
    res.json({
      message: `Usunięto postać: ${deletedCharacter.name}. Relacje zaktualizowane kaskadowo.`,
    });
  } catch (err) {
    handleError(res, err, "Nie udało się usunąć postaci");
  }
});

export default router;
