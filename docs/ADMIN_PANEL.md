# VaultCollector — Admin Panel

**Typ:** Internal Dashboard (Next.js + Tailwind CSS)
**Zweck:** Betreiber-Dashboard für Monitoring, User-Management, Support
**Priorität:** Mittel — nach App-Launch aufbauen

---

## URL-Struktur

```
admin.vaultcollector.app/          → Dashboard (Login required)
admin.vaultcollector.app/users     → User-Verwaltung
admin.vaultcollector.app/scans     → KI-Scan Monitoring
admin.vaultcollector.app/revenue   → Revenue & Subscriptions
admin.vaultcollector.app/support   → Support-Tickets (später)
admin.vaultcollector.app/system    → System Health
```

---

## Screens

### 1. Dashboard (Übersicht)
Wichtigste KPIs auf einen Blick:

**User-Metriken**
- Total Users (Free / Premium / Pro Aufteilung)
- Neue Registrierungen (heute / 7 Tage / 30 Tage)
- Aktive User (DAU / WAU / MAU)
- Churn Rate

**Collection-Metriken**
- Total Items gespeichert
- Total Collections
- Durchschnittliche Items pro User
- Beliebteste Kategorie (Pokemon vs Magic vs Yu-Gi-Oh)

**Scan-Metriken**
- Scans heute / diese Woche / diesen Monat
- Durchschnittliche Confidence Score
- Scan-Erfolgsrate (erkannt vs nicht erkannt)
- Top erkannte Karten

**Revenue**
- MRR (Monthly Recurring Revenue)
- Subscription-Verteilung (Free/Premium/Pro)
- Conversion Rate (Free → Paid)

### 2. User-Verwaltung

**User-Liste**
- Tabelle: Email, Name, Tier, Items, Scans (Monat), Registriert am, Letzter Login
- Filter: Tier, Registrierungsdatum, Aktivität
- Suche: Nach Email oder Name
- Sortierung: Alle Spalten

**User-Detail**
- Profil-Übersicht (Email, Name, Tier, Registriert, Letzter Login)
- Collections (Anzahl, Namen)
- Items (Gesamtzahl, nach Kategorie)
- Scan-Usage (aktueller Monat, Historie)
- Subscription-Historie (Upgrades, Downgrades, Kündigungen)
- Aktionen: Tier ändern, Account deaktivieren, Daten exportieren

### 3. KI-Scan Monitoring

**Scan-Dashboard**
- Scans pro Stunde/Tag (Chart)
- Confidence-Verteilung (Histogramm)
- Fehlerrate (nicht erkannt, niedrige Confidence)
- OpenAI API-Kosten (geschätzt pro Scan)

**Scan-Log**
- Tabelle: Timestamp, User, TCG-Typ, Kartenname, Confidence, Dauer
- Filter: TCG-Typ, Confidence-Range, Zeitraum
- Detail: AI-Response, erkannte Felder, Fallback-Suchen

**Kosten-Tracking**
- OpenAI API-Kosten pro Tag/Monat
- Kosten pro Scan (Durchschnitt)
- Kosten pro User-Tier
- Budget-Warnung wenn Limit erreicht

### 4. Revenue & Subscriptions

**Übersicht**
- MRR-Chart (Monatsverlauf)
- Tier-Verteilung (Pie Chart)
- Neue Subscriptions vs Kündigungen (Bar Chart)
- LTV (Lifetime Value) pro Tier

**Subscription-Events**
- Tabelle: Timestamp, User, Event (Subscribe, Renew, Cancel, Upgrade, Downgrade)
- RevenueCat Webhook-Log

### 5. Support (Phase 2)

**Ticket-System** (einfach)
- User können Feedback/Bugs direkt aus der App senden
- Admin sieht: User, Nachricht, Screenshot (optional), App-Version, Device
- Status: Offen, In Bearbeitung, Gelöst
- Antwort per Email

### 6. System Health

**Status-Dashboard**
- Supabase: DB-Connections, Storage, Bandbreite
- Edge Functions: Aufrufe, Fehlerrate, Latenz
- Externe APIs: Pokemon TCG, Scryfall, YGOPRODeck (Verfügbarkeit)
- OpenAI: API-Status, Rate Limits

**Alerts**
- Email-Benachrichtigung bei: Hohe Fehlerrate, API-Ausfall, Kosten-Limit

---

## Technische Umsetzung

### Stack
- **Framework:** Next.js 14+ (App Router)
- **UI:** Tailwind CSS + shadcn/ui (für Tabellen, Charts, Forms)
- **Charts:** Recharts oder Tremor
- **Auth:** Supabase Auth (nur Admin-Emails erlaubt)
- **Hosting:** Vercel
- **Domain:** admin.vaultcollector.app

### Datenquellen
- **User/Collection/Item/Scan-Daten:** Direkt aus Supabase (Admin-Role mit eigenem Service-Key)
- **Revenue:** RevenueCat API oder Webhooks → eigene Tabelle
- **OpenAI-Kosten:** Aus Edge Function Logs oder separater Tracking-Tabelle
- **System Health:** Supabase Dashboard API + externe Health-Checks

### Sicherheit
- Zugang NUR für definierte Admin-Emails (Whitelist in Supabase RLS)
- Eigene Supabase-Rolle `admin` mit Read-Only auf alle Tabellen
- Kein Schreibzugriff auf User-Daten (außer Tier-Änderung)
- Audit-Log für Admin-Aktionen
- Kein öffentlicher Zugang, kein SEO

### DB-Erweiterungen (benötigt)

```sql
-- Admin-Zugriff via RLS Policy
CREATE POLICY "Admin read all" ON profiles
  FOR SELECT TO authenticated
  USING (auth.email() IN ('admin@example.com'));

-- Scan-Log Tabelle (für Monitoring)
CREATE TABLE scan_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tcg_type text,
  card_name text,
  confidence float,
  duration_ms int,
  ai_cost_usd float,
  created_at timestamptz DEFAULT now()
);

-- Revenue Events (Webhook-Log)
CREATE TABLE revenue_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text, -- subscribe, renew, cancel, upgrade, downgrade
  tier text,
  amount_eur float,
  created_at timestamptz DEFAULT now()
);
```

---

## Priorisierung

### Phase 1 (MVP — direkt nach App-Launch)
1. Dashboard mit User-Count und Scan-Count
2. User-Liste mit Suche und Filter
3. Scan-Log mit Confidence-Tracking
4. Login nur für Admin-Email

### Phase 2 (Wenn Revenue fließt)
5. Revenue Dashboard (RevenueCat Integration)
6. OpenAI-Kosten Tracking
7. System Health Monitoring

### Phase 3 (Wenn User-Base wächst)
8. Support-Ticket System
9. Alerts und Benachrichtigungen
10. User-Detail mit Aktionen (Tier ändern etc.)
