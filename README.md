# 🥗 Lazy Girl Meal Planner Backend 🥗

A clean backend for a **meal planning app**, designed for real-life usage rather than perfect data, a true lazy trait.

This project focuses on:

- pragmatic data modelling
- robust API design
- graceful handling of imperfect user input

---

## Project Philosophy

Most meal planners assume users:

- follow recipes precisely
- measure everything perfectly
- enjoy data entry

This backend assumes the opposite.

**Lazy Girl Meal Planner** is built around the idea that:

- users may type *“100 g chicken breast”* or *“salt to taste”*
- recipes may start as messy free text
- structure should *emerge*, not be forced

The system accepts imperfect input first, then progressively structures it.

---

## Key Design Decisions

### 1. Hybrid Ingredient Parsing (Manual-first, AI-ready)

Ingredients are initially entered as free text:

```
100 g chicken breast
1 cup rice
salt to taste
```

The backend:

- parses what it can (quantity, unit, name)
- gracefully falls back when it can’t
- never blocks recipe creation

Each ingredient line is classified as:

- `parsed`
- `partial`
- `unparsed`

This enables future enhancements such as:

- AI-assisted parsing
- URL-based recipe imports
- post-save cleanup or refinement

---

### 2. Structured Data Without UX Penalty

Internally, ingredients are stored in a normalized structure:

- `Ingredient` — canonical ingredient names
- `RecipeIngredient` — quantity, unit, notes per recipe

But users are **not forced** to think in database terms.

The backend handles the complexity.

---

### 3. Explicit Domain Boundaries

The codebase is intentionally layered:

```
features/
  recipes/
    recipe.routes.ts   // HTTP layer
    recipe.data.ts     // data access & orchestration
    recipe.types.ts    // domain + DTO types
    ingredientParser.ts
  planner/
    planner.routes.ts
    planner.data.ts
    planner.types.ts
```

Each layer has a clear responsibility:

- routes validate input & return responses
- data files coordinate Prisma operations
- parsing logic is isolated and testable

---

### 4. Planner Designed for Reality

The planner:

- auto-creates missing week entries
- guarantees a full week grid (day × slot)
- allows empty slots by design
- validates recipe references at assignment time

This prevents:

- partial planner states
- fragile frontend assumptions
- race conditions during planning

---

## Tech Stack

- **Node.js + TypeScript**
- **Express**
- **Prisma ORM**
- **PostgreSQL**

---

## API Overview

### Health

```
GET /health
```

### Recipes

```
GET    /recipes
GET    /recipes/:id
POST   /recipes
PATCH  /recipes/:id
DELETE /recipes/:id
```

### Planner

```
GET  /planner/week?startDate=YYYY-MM-DD
POST /planner/week/slot
```

---

## Example: Create Recipe

```bash
curl -X POST http://localhost:8000/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test Recipe",
    "effortLevel":"low",
    "ingredientsText":"100 g chicken breast\n1 cup rice\nsalt to taste"
  }'
```

**Response**

```json
{
  "id": 5,
  "name": "Test Recipe",
  "ingredients": [
    "chicken breast",
    "rice",
    "salt to taste"
  ],
  "effortLevel": "low"
}
```

---

## Authentication (Dev Mode)

Authentication is currently mocked via middleware:

- a user is auto-created per request
- identified by `x-user-email` header (optional)
- defaults to `dev@lazy-girl.local`

This keeps API logic realistic without blocking development.

---

## Work in Progress

Planned enhancements:

- Centralised error handling (`AppError`, async handlers) - In Progress
- Validation schemas (Zod)
- AI-assisted ingredient parsing
- URL recipe imports
- Nutrition metadata (optional, non-blocking)
- User preferences (week start day, meal slots)

---
