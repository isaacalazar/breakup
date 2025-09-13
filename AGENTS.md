# Repository Guidelines

## Project Structure & Module Organization
- `app/`: Expo Router screens and groups (e.g., `(tabs)`, `(auth)`, `index.tsx`).
- `components/`: Shared UI (plus `components/ui/` primitives). Prefer co-locating feature-specific pieces under `src/components/`.
- `src/`: App logic: `lib/`, `providers/`, `services/`, `stores/`, `utils/`, and `components/`.
- `assets/`: Images and fonts. Update `app.json` if adding app icons/splash.
- `ios/`: Native iOS artifacts (managed by Expo).
- `scripts/`: Maintenance scripts (e.g., `reset-project`).

## Build, Test, and Development Commands
- `npm install`: Install deps.
- `npm run start`: Launch Metro + Expo Dev Tools.
- `npm run ios` / `npm run android`: Run on simulator/emulator/device.
- `npm run web`: Run web target.
- `npm run lint`: Lint via `eslint-config-expo`.
- `npm run reset-project`: Replace starter with a blank `app/` scaffold.

## Coding Style & Naming Conventions
- Language: TypeScript (strict). Indent 2 spaces.
- Components: Functional, PascalCase filenames (e.g., `ParallaxScrollView.tsx`).
- Hooks: `useX.ts` naming in `hooks/` or `src/hooks/`.
- Exports: Prefer named exports.
- Styling: Tailwind via NativeWind (`className`); keep class order sensible. Avoid inline styles unless necessary.
- Linting: Fix warnings before PR; run `npm run lint`.

## Testing Guidelines
- No formal test suite yet. If adding tests, use Jest + `@testing-library/react-native`.
- Place tests beside sources or under `__tests__/`. Name as `*.test.ts(x)`.
- Keep tests deterministic; mock network and time.

## Commit & Pull Request Guidelines
- Commits: Clear, imperative subject (≤72 chars). Example: `onboarding: rewrite flow and add stores`.
- PRs: Include purpose, screenshots/screen-recordings for UI, steps to validate, and linked issues.
- Keep changes scoped; update docs and `app.json`/`eas.json` when relevant.

## Security & Configuration Tips
- Do not commit secrets. Use `.env.local` and EAS Secrets; never hardcode keys in code or `app.json`.
- Validate platform changes on both iOS and Android.

## Agent-Specific Instructions
- Follow Expo Router conventions; place new routes in `app/` with descriptive filenames.
- Keep patches minimal and aligned with existing structure; prefer small, focused PRs.
