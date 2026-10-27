---
paths:
  - "maestro/**"
  - "**/__tests__/**"
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
---

# Testing Requirements

## Every Feature MUST Include
1. **Maestro E2E test** in `maestro/` — test the happy path user flow
2. **Edge cases** — loading states, error states, empty states
3. **Offline behavior** — what happens without internet?

## Maestro E2E Tests
- One YAML file per feature flow in `maestro/`
- File naming: `feature-name.yaml` (e.g., `barcode-scan.yaml`, `add-item.yaml`)
- Every test must start with `launchApp` and end with an assertion
- Test both success and error paths
- **Always use `testID` for element selection** — never rely on text matching alone
- Every interactive element (Button, Input, Pressable) MUST have a `testID` prop
- testID naming: `kebab-case` with screen prefix (e.g., `auth-email-input`, `collection-create-btn`)
- Use `assertVisible` with `id` for assertions

Example:
```yaml
appId: com.vaultcollector.app
---
- launchApp
- tapOn:
    id: "welcome-email-btn"
- tapOn:
    id: "email-password-toggle"
- inputText:
    id: "email-input"
    text: "test@example.com"
- inputText:
    id: "email-password-input"
    text: "${MAESTRO_TEST_PASSWORD}"
- tapOn:
    id: "email-submit-btn"
- assertVisible:
    id: "tabs-home"
```

## Backend Tests (Deno)
- Use Deno's built-in test runner (`deno test`) — no Jest for backend
- Test files: `__tests__/*.test.ts` inside `services/` and `providers/`
- Use `describe/it` from `https://deno.land/std/testing/bdd.ts`
- Use `assertEquals`, `assertExists` from `https://deno.land/std/assert/mod.ts`
- Test services for business logic (tier limits, price calculation, aggregation)
- Test providers for API response parsing and error handling
- Do NOT test repositories (just CRUD, covered by RLS + E2E)
- Do NOT test Edge Functions (thin handlers, covered by E2E)
- Mock external API calls in provider tests — never hit real APIs
- Run with: `deno test --allow-env --allow-net`

## Unit Tests (when applicable)
- Use Jest for utility functions and shared logic
- Test Zod schemas for validation edge cases
- No unit tests for simple UI components — Maestro covers those
