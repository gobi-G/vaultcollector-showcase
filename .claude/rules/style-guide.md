---
paths:
  - "apps/mobile/src/components/**"
  - "apps/mobile/src/screens/**"
---

# Style Guide

## Design Philosophy
- **Dark-first** glassmorphism with semi-transparent surfaces
- **Plus Jakarta Sans** font family throughout
- NativeWind (Tailwind classes via `className`) — no `StyleSheet.create`
- Import theme constants from `@/constants/theme`

## Color Tokens

### Backgrounds
- `bg-bg-primary` (#0B0F1A) — main background
- `bg-bg-secondary` (#0F1422) — slightly lighter
- `bg-bg-tertiary` (#141B2D) — alternative sections

### Surfaces (Glassmorphism)
- `bg-surface` (rgba(20,27,45,0.7)) — standard cards
- `bg-surface-elevated` (rgba(30,39,63,0.6)) — emphasized cards
- `bg-surface-glass` (rgba(255,255,255,0.05)) — subtle glass
- `border-surface-border` (rgba(255,255,255,0.08)) — borders

### Text
- `text-text-primary` (#FFFFFF) — main text
- `text-text-secondary` (#9CA3AF) — labels, secondary
- `text-text-muted` (#4E5C75) — least prominent

### Brand & Status
- `bg-primary` (#305BF3) / `text-primary-light` (#6FBAFC) — brand blue
- `bg-success-muted` + `text-success-light` — positive (green)
- `bg-danger-muted` + `text-danger-light` — destructive (red)
- `bg-warning-muted` + `text-warning-light` — caution (amber)

## Typography

### Font Classes
- `font-sans` — Regular (400)
- `font-sans-medium` — Medium (500)
- `font-sans-semibold` — SemiBold (600)
- `font-sans-bold` — Bold (700)
- `font-sans-extrabold` — ExtraBold (800)

### Hierarchy
- **Large heading:** `font-sans-extrabold text-4xl text-text-primary`
- **Section header:** `font-sans-semibold text-lg text-text-primary`
- **Label:** `font-sans-medium text-sm text-text-secondary`
- **Body:** `font-sans text-base text-text-primary`
- **Caption:** `font-sans text-xs text-text-muted`

## Spacing (4px base)
`xs=4 sm=8 md=12 lg=16 xl=20 2xl=24 3xl=32 4xl=40 5xl=48`

Use as: `p-lg`, `px-md`, `gap-sm`, `mt-xs`, `mb-lg`

## Border Radius
`rounded-sm=8 rounded-md=12 rounded-lg=16 rounded-xl=20 rounded-2xl=24 rounded-full=pill`

## UI Components (import from `@/components/ui`)

### Button
```tsx
<Button label="Save" variant="primary" size="lg" onPress={fn} />
```
Variants: `primary` | `secondary` | `outline` | `ghost` | `danger`
Sizes: `sm` | `md` | `lg`

### GlassCard
```tsx
<GlassCard elevated>{children}</GlassCard>
```
Default: `rounded-lg border border-surface-border bg-surface p-lg`
Elevated: uses `bg-surface-elevated rounded-xl`

### Badge
```tsx
<Badge label="Mint" variant="success" />
```
Variants: `default` | `success` | `danger` | `warning` | `primary`

### Input
```tsx
<Input label="Email" placeholder="Enter email..." value={v} onChangeText={set} />
```

### ConfirmSheet
```tsx
<ConfirmSheet visible title="Delete?" message="..." destructive onConfirm={fn} onCancel={fn} />
```

## Common Layout Patterns

### Screen wrapper
```tsx
<SafeAreaView style={{ flex: 1, backgroundColor: colors.background.primary }}>
  {/* content */}
</SafeAreaView>
```

### Card with content
```tsx
<GlassCard elevated>
  <Text className="font-sans-medium text-sm text-text-secondary">Label</Text>
  <Text className="mt-xs font-sans-extrabold text-4xl text-text-primary">$10,000</Text>
</GlassCard>
```

### List row
```tsx
<View className="flex-row items-center justify-between py-md">
  <View className="flex-row items-center gap-md">
    <View className="h-[40px] w-[40px] items-center justify-center rounded-full bg-surface-glass">
      <Text>{icon}</Text>
    </View>
    <View>
      <Text className="font-sans-semibold text-base text-text-primary">{label}</Text>
      <Text className="font-sans text-xs text-text-muted">{sublabel}</Text>
    </View>
  </View>
</View>
```

### Stats section with divider
```tsx
<View className="mt-lg flex-row items-center justify-between border-t border-surface-border pt-lg">
  {/* stat columns */}
</View>
```
