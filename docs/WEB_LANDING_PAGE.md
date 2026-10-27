# VaultCollector — Web Landing Page

**Typ:** One-Page Landing Page (Next.js + Tailwind CSS)
**Zweck:** App-Download treiben, Vertrauen aufbauen, rechtliche Pflichten erfüllen
**Priorität:** Niedrig — Primärfokus ist die Mobile App

---

## URL-Struktur

```
vaultcollector.app/                → Landing Page (One-Pager)
vaultcollector.app/privacy         → Privacy Policy (EN)
vaultcollector.app/datenschutz     → Datenschutzerklärung (DE)
vaultcollector.app/terms           → Terms of Service (EN/DE)
vaultcollector.app/impressum       → Impressum (DE)
```

---

## Sektionen (Top → Bottom)

### 1. Hero
- App-Name + Tagline: "Smart Inventory Tracker for Collectors"
- Kurzer Satz: "Track, scan, and value your Pokemon, Magic, and Yu-Gi-Oh cards"
- App Store + Google Play Badges (Download-Buttons)
- Hero-Image: iPhone Mockup mit HomeScreen oder Scan-Screen
- Dark Background passend zum App-Theme (#0B0F1A)

### 2. Features (3-4 Karten)
- **AI Card Scanner** — "Scan any card with your camera. AI identifies it instantly."
- **Live Market Prices** — "See what your collection is worth. Updated from TCGplayer & Scryfall."
- **Smart Organization** — "Collections, conditions, locations. Everything in one place."
- **Portfolio Tracking** — "Watch your collection value grow over time."

### 3. Supported Categories
- Pokemon TCG, Magic: The Gathering, Yu-Gi-Oh! (mit Icons/Logos)
- "LEGO & Watches — Coming Soon" (ausgegraut)

### 4. How It Works (3 Steps)
1. **Scan** — Point your camera at any card
2. **Identify** — AI recognizes the card, set, and condition
3. **Track** — Add to your collection and watch the value

### 5. Pricing
- Free / Premium / Pro Vergleichstabelle
- Gleiche Tiers wie in der App
- CTA: "Download Free" Button

### 6. Screenshots
- 3-4 App-Screenshots im iPhone Frame
- HomeScreen, Scan, Collection, Item Detail

### 7. Footer
- Links: Privacy Policy, Terms of Service, Impressum, Datenschutz
- "Made in Germany" + GSI Digital
- Social Links (optional, wenn vorhanden)
- Contact: <contact email>

---

## Technische Umsetzung

### Stack
- **Framework:** Next.js 14+ (App Router)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel (Free Tier reicht)
- **Domain:** vaultcollector.app

### Anforderungen
- Responsive (Mobile-first, sieht auch auf Desktop gut aus)
- Dark Theme (passend zur App)
- SEO: Meta-Tags, Open Graph, Schema.org
- Performance: Lighthouse Score > 90
- Legal Pages als separate Routen (SSG)
- Sprache: Englisch (Hauptseite), Legal-Seiten DE + EN

### Nicht benötigt (Phase 1)
- Blog
- Changelog
- Docs/API
- Login/Dashboard
- Analytics (kein Tracking, DSGVO-konform)

---

## Content-Quellen

- Feature-Texte: Aus App Store Listing (`docs/business/APP_STORE_LISTING.md`)
- Legal-Texte: Aus `docs/legal/`
- Screenshots: Aus Simulator exportieren
- App Icon: `assets/icon.png`

---

## Timeline

Phase 1 (Pre-Launch): Hero + Features + Pricing + Legal Pages
Phase 2 (Post-Launch): Screenshots, App Store Badges, Testimonials
