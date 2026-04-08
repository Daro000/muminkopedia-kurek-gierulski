# 📄 docs/schema.md — Muminkopedia API

## 1. Modele Mongoose

### `Character` (Postać)

| Pole | Typ TS | Typ Mongoose | Wymagane | Domyślnie | Opis |
|---|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | auto | ID dokumentu (MongoDB) |
| `name` | `string` | `String` | ✅ tak | — | Imię postaci (np. "Muminek") |
| `description` | `string` | `String` | ✅ tak | — | Opis postaci |
| `species` | `string` | `String` | ✅ tak | — | Gatunek (np. "Muminek", "Paszczak", "Miukk") |
| `isHibernating` | `boolean` | `Boolean` | ❌ nie | `false` | Czy śpi snem zimowym? |
| `bestFriend` | `ObjectId` | `Schema.Types.ObjectId` | ❌ nie | `null` | Ref → `Character` |

```typescript
// src/models/Character.ts
import mongoose, { Document } from "mongoose";

export interface Character extends Document {
    name: string;
    description: string;
    species: string;
    isHibernating: boolean;
    bestFriend?: mongoose.Types.ObjectId;
}

const CharacterSchema = new mongoose.Schema({
    name:          { type: String,  required: true },
    description:   { type: String,  required: true },
    species:       { type: String,  required: true },
    isHibernating: { type: Boolean, default: false },
    bestFriend:    { type: mongoose.Schema.Types.ObjectId, ref: "Character", default: null },
});

export default mongoose.model<Character>("Character", CharacterSchema);
```

---

### `Artifact` (Artefakt)

| Pole | Typ TS | Typ Mongoose | Wymagane | Domyślnie | Opis |
|---|---|---|---|---|---|
| `_id` | `ObjectId` | auto | — | auto | ID dokumentu |
| `name` | `string` | `String` | ✅ tak | — | Nazwa (np. "Kapelusz Tajemniczego Pana") |
| `properties` | `string` | `String` | ✅ tak | — | Opis właściwości (np. "zmienia rzeczy w chmury") |
| `owner` | `ObjectId` | `Schema.Types.ObjectId` | ❌ nie | `null` | Ref → `Character` |

```typescript
// src/models/Artifact.ts
import mongoose, { Document } from "mongoose";

export interface Artifact extends Document {
    name: string;
    properties: string;
    owner?: mongoose.Types.ObjectId;
}

const ArtifactSchema = new mongoose.Schema({
    name:       { type: String, required: true },
    properties: { type: String, required: true },
    owner:      { type: mongoose.Schema.Types.ObjectId, ref: "Character", default: null },
});

export default mongoose.model<Artifact>("Artifact", ArtifactSchema);
```

---

## 2. Plan Relacji

### `owner` — `ObjectId` czy `String`?

**Decyzja: `ObjectId` z `ref: "Character"`**

| | String | ObjectId (ref) |
|---|---|---|
| Spójność danych | ❌ brak (można wpisać cokolwiek) | ✅ powiązanie z realnym dokumentem |
| `populate()` | ❌ niemożliwe | ✅ możliwe (React dostanie pełny obiekt właściciela) |
| Walidacja | ❌ brak | ✅ MongoDB sprawdza format |

### Dylemat Paszczaka — co z artefaktami po usunięciu postaci?

Wybieramy strategię **"osierocenia"** (`owner → null`):

- Gdy postać zostanie usunięta z Doliny (`DELETE /characters/:id`), jej artefakty **pozostają w bazie**, ale pole `owner` ustawiamy na `null`.
- Implementacja: w trasie `DELETE /characters/:id` dodajemy:

```typescript
await ArtifactModel.updateMany({ owner: id }, { $set: { owner: null } });
```

Alternatywa — **kaskadowe usunięcie** artefaktów razem z postacią — byłaby możliwa, ale tracimy wtedy dane o magicznych przedmiotach. Paszczak jako Dyrektor Archiwum wybrałby zachowanie artefaktów. 🧐

### Relacja `bestFriend`

- Pole `bestFriend` w `Character` to `ObjectId` wskazujący na **inny dokument `Character`**.
- Jest **opcjonalne** — nie każda postać musi mieć najlepszego przyjaciela w bazie.
- Uwaga: to relacja jednostronna — jeśli Muminek wskazuje na Włóczykija, Włóczykij nie wskazuje automatycznie na Muminka.

---

## 3. Lista Endpointów

### Characters

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/api/characters` | Pobierz wszystkie postaci |
| `GET` | `/api/characters/:id` | Pobierz jedną postać (z populate bestFriend) |
| `POST` | `/api/characters` | Dodaj nową postać |
| `PUT` | `/api/characters/:id` | Zaktualizuj postać |
| `DELETE` | `/api/characters/:id` | Usuń postać (+ null owner w artefaktach) |

### Artifacts

| Metoda | Ścieżka | Opis |
|---|---|---|
| `GET` | `/api/artifacts` | Pobierz wszystkie artefakty |
| `GET` | `/api/artifacts/:id` | Pobierz jeden artefakt (z populate owner) |
| `POST` | `/api/artifacts` | Dodaj nowy artefakt |
| `PUT` | `/api/artifacts/:id` | Zaktualizuj artefakt |
| `DELETE` | `/api/artifacts/:id` | Usuń artefakt |

---

## 4. Struktura projektu (docelowa)

```
muminkopedia/
  |- bin/
  |    └── www.ts
  |- src/
  |    ├── config/
  |    |      └── db.ts
  |    ├── models/
  |    |      ├── Character.ts
  |    |      └── Artifact.ts
  |    ├── routes/
  |    |      ├── characterRoutes.ts
  |    |      └── artifactRoutes.ts
  |    └── app.ts
  |- tests/
  |    └── muminkopedia-requests.http
  |- .env
  |- package.json
  |- tsconfig.json
```

---

## 5. Format JSON — odpowiedzi API

React będzie oczekiwał przewidywalnego formatu. Ustalamy:

```json
// GET /api/characters
[
  {
    "_id": "664f1a2b3c4d5e6f7a8b9c0d",
    "name": "Muminek",
    "description": "Główny bohater, mieszka w Dolinie Muminków.",
    "species": "Muminek",
    "isHibernating": false,
    "bestFriend": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0e",
      "name": "Włóczykij"
    }
  }
]

// GET /api/artifacts
[
  {
    "_id": "664f1a2b3c4d5e6f7a8b9c1a",
    "name": "Kapelusz Tajemniczego Pana",
    "properties": "Zmienia rzeczy wrzucone do środka w coś zupełnie innego.",
    "owner": {
      "_id": "664f1a2b3c4d5e6f7a8b9c0d",
      "name": "Muminek"
    }
  }
]
```