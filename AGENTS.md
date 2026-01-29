# AGENTS.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a NestJS backend application called "be-the-last-empire" that uses:
- **Supabase** for hosted PostgreSQL database
- **Drizzle ORM** for database operations and migrations
- **TypeScript** for type-safe development
- **Jest** for unit and e2e testing

## Essential Commands

### Development
```bash
npm run start:dev          # Run in watch mode (recommended for development)
npm run start              # Run once
npm run start:debug        # Run with debugger attached
npm run build              # Compile TypeScript to dist/
```

### Database Operations
```bash
npm run drizzle:generate   # Generate migration from schema.ts changes
npm run drizzle:push       # Apply migrations to database
npm run db:seed            # Seed database with mock users
```

**Important**: Always run `drizzle:generate` after modifying `src/db/schema.ts`, then `drizzle:push` to apply changes.

### Testing
```bash
npm run test               # Run unit tests
npm run test:watch         # Run unit tests in watch mode
npm run test:cov           # Run with coverage report
npm run test:e2e           # Run e2e tests
```

### Code Quality
```bash
npm run lint               # Run ESLint with auto-fix
npm run format             # Format code with Prettier
```

## Architecture

### Database Layer (`src/db/`)
- **`schema.ts`**: Drizzle schema definitions (single source of truth for database structure)
- **`drizzle.provider.ts`**: NestJS provider that creates Drizzle database instance using `DRIZZLE_PROVIDER` token
- **`drizzle.module.ts`**: Exports the Drizzle provider for use in feature modules
- **`seed.ts`**: Standalone script for seeding database

**Pattern**: Feature modules import `DrizzleModule` and inject the database using:
```typescript
@Inject(DRIZZLE_PROVIDER) private db: PostgresJsDatabase<typeof schema>
```

### Module Structure
The application follows NestJS modular architecture:
- **`app.module.ts`**: Root module that imports `ConfigModule` (global) and feature modules
- **Feature modules** (e.g., `users.module.ts`): Self-contained modules with controller, service, and necessary imports
- Each feature that needs database access must import `DrizzleModule`

### Configuration
- **`.env`**: Contains Supabase credentials and `DATABASE_URL` (never commit this file)
- **`.env.example`**: Template for required environment variables
- **`ConfigModule`**: Configured globally in `app.module.ts` using `forRoot({ isGlobal: true })`

### Entry Point
- Application starts on port 3000 (configurable via `PORT` env var)
- Main entry: `src/main.ts` → bootstraps `AppModule`

## Key Patterns

### Adding a New Feature Module
1. Create module directory under `src/` (e.g., `src/posts/`)
2. Generate with NestJS CLI: `nest g module posts` and `nest g service posts` and `nest g controller posts`
3. Import `DrizzleModule` in the feature module if database access is needed
4. Inject database in service using `@Inject(DRIZZLE_PROVIDER)`
5. Import feature module in `app.module.ts`

### Database Schema Changes
1. Modify `src/db/schema.ts`
2. Run `npm run drizzle:generate` to create migration
3. Run `npm run drizzle:push` to apply to database
4. Migration files are stored in `./drizzle/` directory

### Testing
- Unit tests: Co-located with source files (e.g., `users.service.spec.ts`)
- E2E tests: Located in `test/` directory with `.e2e-spec.ts` suffix
- Jest config is embedded in `package.json`
