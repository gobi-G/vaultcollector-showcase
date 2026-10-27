---
paths:
  - "apps/mobile/**"
---

# Mobile Development Rules

## App Structure (apps/mobile/)
```
app/                → Expo Router pages — thin re-exports ONLY (1-liners)
src/
├── screens/        → Screen components with business logic
│   ├── auth/       → WelcomeScreen, EmailScreen
│   ├── home/       → HomeScreen
│   ├── collection/ → CollectionListScreen, AddItemScreen, ItemDetailScreen
│   ├── vault/      → VaultScreen
│   ├── profile/    → ProfileScreen
│   └── scan/       → ScanScreen
├── components/
│   ├── ui/         → Base components (Button, Card, Badge, Input, ConfirmSheet)
│   └── features/   → Feature components (PortfolioCard, LocationPicker)
├── hooks/
│   └── queries/    → TanStack Query hooks (useItem, useCollection, etc.)
├── services/       → Service layer (interfaces + implementations)
├── stores/         → Zustand stores
├── providers/      → ThemeProvider, AuthProvider, QueryProvider
├── constants/      → Theme, config
├── utils/          → Helper functions
├── types/
│   └── vendor.d.ts → Type augmentations for third-party libs (vision-camera, MLKit)
├── config/         → App config, env
└── i18n/           → Translations (DE, EN, FR, ES)
```

## Clean Architecture (Service Layer)
- NEVER import Supabase (or any backend) directly in screens, hooks, or components
- All data access goes through service interfaces in `src/services/interfaces/`
- Active implementations live in `src/services/implementations/supabase/`
- Import services ONLY from `@/services` (the barrel file) — never from implementations
- To swap backends, only change `src/services/index.ts` — nothing else
- Service interfaces: `IAuthService`, `ICollectionRepository`, `IItemRepository`, `IPriceHistoryRepository`, `IStorageService`
- Example: `import { itemRepository } from "@/services"` — NOT `import { supabase } from "..."`

## TanStack Query Hooks
- Wrap ALL data fetching in custom hooks in `src/hooks/queries/`
- Hooks encapsulate queryKey, caching logic, and repository calls
- Screens use hooks, never repositories directly
- Naming: `useItem(id)`, `useCollections()`, `usePortfolioValue()`
- Example:
```typescript
// src/hooks/queries/useItem.ts
export function useItem(id: string) {
  return useQuery({
    queryKey: ["item", id],
    queryFn: () => itemRepository.getById(id),
  });
}

// Screen usage — clean and simple
const { data: item, isLoading, error } = useItem(id);
```
- Mutations go in the same file: `useCreateItem()`, `useUpdateItem()`, `useDeleteItem()`
- Always invalidate related queries after mutations

## React Native / Expo
- Use Expo Router for all navigation — file-based routing in `app/` directory
- Style with NativeWind (Tailwind classes) — no StyleSheet.create
- Use `className` prop — no inline style objects
- Responsive design: test on iPhone SE (small) and iPhone 15 Pro Max (large)
- Always handle loading, error, and empty states in screens
- Use SafeAreaView for all top-level screen components
- Images: use expo-image (not React Native Image) for better caching
- Image placeholders: always use `blurhash` or a skeleton placeholder to prevent layout shifts
- For card images, use a generic card-back skeleton as the placeholder

## State Management
- TanStack Query for ALL server/API data — never useState for API data
- Zustand only for client-side UI state (modals, filters, theme)
- No prop drilling deeper than 2 levels — use context or Zustand
- MMKV for persistent offline data

## Vendor Type Augmentations
- Third-party libs with bad/missing types: add augmentations to `src/types/vendor.d.ts`
- Common cases: react-native-vision-camera frame processors, MLKit types
- NEVER use `any` or `@ts-ignore` inline — always fix it in vendor.d.ts
