# SkillSnap – AI Career Roadmap Generator (FIX1)

This build pins compatible versions and uses a multiline Prisma schema to avoid parsing issues on Prisma v6.

## Install

```bash
npm install
```

## Configure
Copy env and fill values:
```bash
cp .env.example .env
```

## Prisma
```bash
npx prisma generate
npx prisma migrate dev --name init
```

## (Optional) Seed
```bash
npm run seed
```

## Dev
```bash
npm run dev
```

### Versions pinned
- prisma / @prisma/client: **6.14.x**
- @auth/prisma-adapter: **2.10.x**