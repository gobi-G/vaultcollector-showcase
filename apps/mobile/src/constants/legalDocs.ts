// Operator details for the legal texts come from the environment so they stay out of the repository.
export const LEGAL_OPERATOR = {
  name: process.env.EXPO_PUBLIC_LEGAL_OWNER_NAME ?? "[Owner name]",
  street: process.env.EXPO_PUBLIC_LEGAL_STREET ?? "[Street]",
  city: process.env.EXPO_PUBLIC_LEGAL_CITY ?? "[Postcode City]",
  email: process.env.EXPO_PUBLIC_CONTACT_EMAIL ?? "[contact email]",
};

export type LegalDocType = "privacyPolicy" | "termsOfService" | "impressum";

type LegalDoc = {
  de: string;
  en: string;
};

export const LEGAL_DOCS: Record<LegalDocType, LegalDoc> = {
  privacyPolicy: {
    en: `Privacy Policy — VaultCollector

Last updated: March 24, 2026

GSI Digital — ${LEGAL_OPERATOR.name}
${LEGAL_OPERATOR.street}, ${LEGAL_OPERATOR.city}, Germany
Contact: ${LEGAL_OPERATOR.email}

1. Introduction

VaultCollector ("the App") is a smart inventory tracker for collectors of Trading Card Games (TCG), LEGO, watches, and other collectibles. This Privacy Policy explains how we collect, use, and protect your personal data when you use the App.

2. Data Controller

The data controller responsible for your personal data is:

GSI Digital
${LEGAL_OPERATOR.name}
${LEGAL_OPERATOR.street}
${LEGAL_OPERATOR.city}, Germany
Email: ${LEGAL_OPERATOR.email}

3. Data We Collect

3.1 Account Data
\u2022 Email address (for authentication)
\u2022 Display name (optional, user-provided)
\u2022 Subscription tier (free/premium/pro)
\u2022 Language preference

3.2 Collection Data
\u2022 Item names, conditions, purchase prices, notes
\u2022 Collection names and descriptions
\u2022 Storage locations (user-defined, e.g., "Shelf A", "Binder 1")
\u2022 Market prices (fetched from public APIs)

3.3 Usage Data
\u2022 AI scan count per month (for tier limit enforcement)
\u2022 App language setting

3.4 Camera Data
\u2022 Card photos are captured temporarily for AI recognition only
\u2022 Photos are sent to OpenAI's API for card identification
\u2022 Photos are NOT stored on our servers after processing
\u2022 We do NOT use your photos for training AI models

3.5 Data We Do NOT Collect
\u2022 Location data (GPS)
\u2022 Contacts
\u2022 Browsing history
\u2022 Device identifiers for advertising
\u2022 Analytics or tracking data (no Mixpanel, no Google Analytics)

4. How We Use Your Data

\u2022 Account creation and authentication \u2014 Contract performance (Art. 6(1)(b))
\u2022 Storing and displaying your collections \u2014 Contract performance (Art. 6(1)(b))
\u2022 AI card recognition via camera \u2014 Consent (Art. 6(1)(a))
\u2022 Fetching market prices from public APIs \u2014 Legitimate interest (Art. 6(1)(f))
\u2022 Enforcing subscription tier limits \u2014 Contract performance (Art. 6(1)(b))

5. Third-Party Services

\u2022 Supabase (EU region) \u2014 Database, authentication, API
\u2022 OpenAI \u2014 AI card recognition (card photos, temporary)
\u2022 Pokemon TCG API \u2014 Card data & prices (search queries only)
\u2022 Scryfall \u2014 Magic card data & prices (search queries only)
\u2022 YGOPRODeck \u2014 Yu-Gi-Oh card data & prices (search queries only)
\u2022 RevenueCat \u2014 Subscription management

6. Data Storage and Security

\u2022 All data is stored on Supabase servers in the EU (Ireland, eu-west-1)
\u2022 Data is encrypted in transit (TLS/HTTPS) and at rest
\u2022 Authentication tokens are stored securely on your device (iOS Keychain / Android Keystore)
\u2022 Row-Level Security (RLS) ensures users can only access their own data
\u2022 API keys are never stored on the client device

7. Data Retention

\u2022 Your data is retained as long as your account is active
\u2022 When you delete your account, ALL data is permanently deleted
\u2022 Deletion is immediate and irreversible

8. Your Rights (GDPR)

As an EU resident, you have the right to:
\u2022 Access your personal data (Art. 15)
\u2022 Rectify inaccurate data (Art. 16)
\u2022 Delete your account and all data (Art. 17) \u2014 available in-app under Profile
\u2022 Export your data as CSV (Art. 20) \u2014 available in-app for Premium/Pro users
\u2022 Restrict processing (Art. 18)
\u2022 Object to processing (Art. 21)
\u2022 Withdraw consent at any time (Art. 7(3))

To exercise your rights, contact us at: ${LEGAL_OPERATOR.email}
We will respond within 30 days as required by GDPR.

9. Children's Privacy

VaultCollector is not intended for children under 16. We do not knowingly collect personal data from children. If you believe a child has provided us with personal data, please contact us at ${LEGAL_OPERATOR.email}.

10. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of significant changes via the App or email.

11. Contact

GSI Digital
${LEGAL_OPERATOR.name}
${LEGAL_OPERATOR.street}
${LEGAL_OPERATOR.city}, Germany
Email: ${LEGAL_OPERATOR.email}`,

    de: `Datenschutzerkl\u00e4rung \u2014 VaultCollector

Stand: 24. M\u00e4rz 2026

1. Verantwortlicher

GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}
E-Mail: ${LEGAL_OPERATOR.email}

2. Welche Daten wir erheben

2.1 Kontodaten
\u2022 E-Mail-Adresse (zur Authentifizierung)
\u2022 Anzeigename (optional, vom Nutzer eingegeben)
\u2022 Abo-Stufe (Free/Premium/Pro)
\u2022 Spracheinstellung

2.2 Sammlungsdaten
\u2022 Objektnamen, Zustand, Kaufpreise, Notizen
\u2022 Sammlungsnamen und Beschreibungen
\u2022 Lagerorte (vom Nutzer definiert)
\u2022 Marktpreise (von \u00f6ffentlichen APIs abgerufen)

2.3 Nutzungsdaten
\u2022 Anzahl der KI-Scans pro Monat
\u2022 App-Spracheinstellung

2.4 Kameradaten
\u2022 Kartenfotos werden nur tempor\u00e4r f\u00fcr die KI-Erkennung erfasst
\u2022 Fotos werden an die OpenAI-API zur Kartenidentifikation gesendet
\u2022 Fotos werden nach der Verarbeitung NICHT auf unseren Servern gespeichert
\u2022 Wir verwenden Ihre Fotos NICHT zum Trainieren von KI-Modellen

2.5 Daten, die wir NICHT erheben
\u2022 Standortdaten (GPS)
\u2022 Kontakte
\u2022 Browserverlauf
\u2022 Ger\u00e4tekennungen f\u00fcr Werbung
\u2022 Analyse- oder Tracking-Daten

3. Zweck und Rechtsgrundlage der Verarbeitung

\u2022 Kontoerstellung und Authentifizierung \u2014 Vertragserf\u00fcllung (Art. 6 Abs. 1 lit. b)
\u2022 Speicherung und Anzeige Ihrer Sammlungen \u2014 Vertragserf\u00fcllung (Art. 6 Abs. 1 lit. b)
\u2022 KI-Kartenerkennung per Kamera \u2014 Einwilligung (Art. 6 Abs. 1 lit. a)
\u2022 Abruf von Marktpreisen \u2014 Berechtigtes Interesse (Art. 6 Abs. 1 lit. f)
\u2022 Durchsetzung von Abo-Limits \u2014 Vertragserf\u00fcllung (Art. 6 Abs. 1 lit. b)

4. Drittanbieter-Dienste

\u2022 Supabase \u2014 Datenbank, Authentifizierung (EU, Irland)
\u2022 OpenAI \u2014 KI-Kartenerkennung (USA)
\u2022 Pokemon TCG API \u2014 Kartendaten & Preise (USA)
\u2022 Scryfall \u2014 Magic-Kartendaten & Preise (USA)
\u2022 YGOPRODeck \u2014 Yu-Gi-Oh-Kartendaten & Preise (EU)
\u2022 RevenueCat \u2014 Abo-Verwaltung (USA)

Hinweis zu Drittland\u00fcbermittlung: Einige Dienste befinden sich in den USA. Die \u00dcbermittlung erfolgt auf Grundlage von Standardvertragsklauseln (Art. 46 Abs. 2 lit. c DSGVO).

5. Datenspeicherung und Sicherheit

\u2022 Alle Daten werden auf Supabase-Servern in der EU (Irland) gespeichert
\u2022 Daten werden w\u00e4hrend der \u00dcbertragung (TLS/HTTPS) und im Ruhezustand verschl\u00fcsselt
\u2022 Row-Level Security (RLS) stellt sicher, dass Nutzer nur auf ihre eigenen Daten zugreifen k\u00f6nnen

6. Speicherdauer

\u2022 Ihre Daten werden gespeichert, solange Ihr Konto aktiv ist
\u2022 Bei Kontol\u00f6schung werden ALLE Daten unwiderruflich gel\u00f6scht
\u2022 Die L\u00f6schung erfolgt sofort und ist unwiderruflich

7. Ihre Rechte (DSGVO)

\u2022 Auskunftsrecht (Art. 15 DSGVO)
\u2022 Recht auf Berichtigung (Art. 16 DSGVO)
\u2022 Recht auf L\u00f6schung (Art. 17 DSGVO) \u2014 in-App unter Profil m\u00f6glich
\u2022 Recht auf Daten\u00fcbertragbarkeit (Art. 20 DSGVO) \u2014 Daten als CSV exportieren
\u2022 Recht auf Einschr\u00e4nkung (Art. 18 DSGVO)
\u2022 Widerspruchsrecht (Art. 21 DSGVO)
\u2022 Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)

Kontakt: ${LEGAL_OPERATOR.email} \u2014 Wir antworten innerhalb von 30 Tagen.

8. Beschwerderecht

Landesbeauftragter f\u00fcr den Datenschutz und die Informationsfreiheit Baden-W\u00fcrttemberg
K\u00f6nigsstra\u00dfe 10a, 70173 Stuttgart
https://www.baden-wuerttemberg.datenschutz.de

9. Minderj\u00e4hrige

VaultCollector richtet sich nicht an Personen unter 16 Jahren.

10. \u00c4nderungen

Wir k\u00f6nnen diese Datenschutzerkl\u00e4rung von Zeit zu Zeit aktualisieren. \u00dcber wesentliche \u00c4nderungen informieren wir Sie \u00fcber die App oder per E-Mail.

11. Kontakt

GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}
E-Mail: ${LEGAL_OPERATOR.email}`,
  },

  termsOfService: {
    en: `Terms of Service \u2014 VaultCollector

Last updated: March 24, 2026

1. Agreement

By using VaultCollector ("the App"), you agree to these Terms of Service. If you do not agree, do not use the App.

The App is operated by:
GSI Digital
${LEGAL_OPERATOR.name}
${LEGAL_OPERATOR.street}
${LEGAL_OPERATOR.city}, Germany
Email: ${LEGAL_OPERATOR.email}

2. Description of Service

VaultCollector is an inventory management app for collectors. The App allows you to:
\u2022 Track collectible items (Trading Cards, LEGO, watches, etc.)
\u2022 Scan and identify cards using AI-powered image recognition
\u2022 View estimated market prices from public data sources
\u2022 Organize items by collection and storage location
\u2022 Export your collection data as CSV

3. User Accounts

\u2022 You must create an account to use the App
\u2022 You are responsible for keeping your login credentials secure
\u2022 You must provide accurate information when creating your account
\u2022 You must be at least 16 years old to use the App

4. Subscription Tiers

Free Tier: Up to 50 items, 1 collection, 5 AI scans per month
Premium (2.99 EUR/month or 24.99 EUR/year): Up to 500 items, 5 collections, 50 AI scans per month, CSV export
Pro (7.99 EUR/month): Unlimited items and collections, unlimited AI scans, CSV export, priority support

Subscriptions are billed through Apple App Store or Google Play Store. Subscriptions auto-renew unless cancelled at least 24 hours before the end of the current period. No refunds for partial subscription periods.

5. Market Prices and Financial Information

\u2022 Market prices displayed in the App are estimates based on publicly available data
\u2022 We do NOT guarantee the accuracy of any price information
\u2022 VaultCollector is NOT a financial advisor
\u2022 Prices are based on the US market (TCGplayer) and may not reflect local market conditions

6. AI Features

\u2022 AI card recognition uses OpenAI's GPT-4o Vision model
\u2022 Recognition accuracy is not guaranteed \u2014 always verify results
\u2022 AI-assessed card conditions are estimates, not professional grading
\u2022 Card photos are processed by OpenAI and are subject to their usage policies

7. Acceptable Use

You agree NOT to:
\u2022 Use the App for any illegal purpose
\u2022 Attempt to reverse-engineer, decompile, or hack the App
\u2022 Use automated tools to scrape data from the App
\u2022 Share your account with others
\u2022 Upload malicious content
\u2022 Abuse the AI scan feature

8. Intellectual Property

\u2022 VaultCollector, its design, and original content are owned by GSI Digital
\u2022 Card images and data are provided by third-party APIs and belong to their respective owners
\u2022 Your collection data belongs to you

9. Limitation of Liability

The App is provided "AS IS" without warranties of any kind. We are not liable for data loss, inaccurate prices, or incorrect card identification. Our total liability is limited to the amount you paid for the App in the 12 months prior to the claim.

10. Account Termination

\u2022 You can delete your account at any time from the Profile screen
\u2022 We may terminate accounts that violate these Terms
\u2022 Upon termination, all your data will be permanently deleted

11. Changes to Terms

We may update these Terms from time to time. Continued use of the App after changes constitutes acceptance.

12. Online Dispute Resolution

The European Commission provides an online dispute resolution platform: https://ec.europa.eu/consumers/odr

13. Governing Law

These Terms are governed by the laws of the Federal Republic of Germany. The courts of Freiburg im Breisgau shall have jurisdiction for any disputes.

14. Contact

GSI Digital
${LEGAL_OPERATOR.name}
${LEGAL_OPERATOR.street}
${LEGAL_OPERATOR.city}, Germany
Email: ${LEGAL_OPERATOR.email}`,

    de: `Allgemeine Gesch\u00e4ftsbedingungen \u2014 VaultCollector

Stand: 24. M\u00e4rz 2026

1. Geltungsbereich

Mit der Nutzung von VaultCollector (\u201edie App\u201c) akzeptierst du diese Allgemeinen Gesch\u00e4ftsbedingungen. Wenn du nicht einverstanden bist, nutze die App nicht.

Die App wird betrieben von:
GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}
E-Mail: ${LEGAL_OPERATOR.email}

2. Leistungsbeschreibung

VaultCollector ist eine Inventar-App f\u00fcr Sammler. Die App erm\u00f6glicht:
\u2022 Sammelobjekte erfassen (Trading Cards, LEGO, Uhren etc.)
\u2022 Karten per KI-Bilderkennung scannen und identifizieren
\u2022 Gesch\u00e4tzte Marktpreise aus \u00f6ffentlichen Quellen anzeigen
\u2022 Objekte nach Sammlung und Standort organisieren
\u2022 Sammlungsdaten als CSV exportieren

3. Nutzerkonto

\u2022 Du musst ein Konto erstellen, um die App zu nutzen
\u2022 Du bist f\u00fcr die Sicherheit deiner Zugangsdaten verantwortlich
\u2022 Du musst korrekte Angaben machen
\u2022 Du musst mindestens 16 Jahre alt sein

4. Abo-Stufen

Free: Bis zu 50 Objekte, 1 Sammlung, 5 KI-Scans pro Monat
Premium (2,99 EUR/Monat oder 24,99 EUR/Jahr): Bis zu 500 Objekte, 5 Sammlungen, 50 KI-Scans pro Monat, CSV-Export
Pro (7,99 EUR/Monat): Unbegrenzt Objekte und Sammlungen, unbegrenzt KI-Scans, CSV-Export, Priorit\u00e4ts-Support

Abos werden \u00fcber den Apple App Store oder Google Play Store abgerechnet. Abos verl\u00e4ngern sich automatisch, sofern nicht mindestens 24 Stunden vor Ablauf gek\u00fcndigt wird. Keine R\u00fcckerstattung f\u00fcr angebrochene Abo-Zeitr\u00e4ume.

5. Marktpreise und Finanzinformationen

\u2022 Marktpreise in der App sind Sch\u00e4tzungen auf Basis \u00f6ffentlich verf\u00fcgbarer Daten
\u2022 Wir garantieren NICHT die Richtigkeit der Preisinformationen
\u2022 VaultCollector ist KEIN Finanzberater
\u2022 Preise basieren auf dem US-Markt (TCGplayer)

6. KI-Funktionen

\u2022 Die KI-Kartenerkennung nutzt OpenAIs GPT-4o Vision Modell
\u2022 Erkennungsgenauigkeit ist nicht garantiert \u2014 Ergebnisse immer pr\u00fcfen
\u2022 KI-Zustandsbewertungen sind Sch\u00e4tzungen, kein professionelles Grading
\u2022 Kartenfotos werden von OpenAI verarbeitet

7. Nutzungsbedingungen

Du verpflichtest dich, die App NICHT zu nutzen f\u00fcr:
\u2022 Illegale Zwecke
\u2022 Reverse Engineering oder Hacking
\u2022 Automatisiertes Scraping
\u2022 Kontoweitergabe
\u2022 Sch\u00e4dliche Inhalte
\u2022 Missbrauch der KI-Scan-Funktion

8. Geistiges Eigentum

\u2022 VaultCollector, Design und Originalinhalte geh\u00f6ren GSI Digital
\u2022 Kartenbilder und -daten stammen von Drittanbieter-APIs
\u2022 Deine Sammlungsdaten geh\u00f6ren dir

9. Haftungsbeschr\u00e4nkung

Die App wird \u201eso wie sie ist\u201c ohne Gew\u00e4hrleistung bereitgestellt. Wir haften nicht f\u00fcr Datenverlust, ungenaue Preise oder falsche Kartenerkennung. Unsere Gesamthaftung ist auf den Betrag beschr\u00e4nkt, den du in den letzten 12 Monaten f\u00fcr die App bezahlt hast.

10. Kontok\u00fcndigung

\u2022 Du kannst dein Konto jederzeit im Profil l\u00f6schen
\u2022 Wir k\u00f6nnen Konten sperren, die gegen diese AGB versto\u00dfen
\u2022 Bei K\u00fcndigung werden alle Daten unwiderruflich gel\u00f6scht

11. \u00c4nderungen

Wir k\u00f6nnen diese AGB \u00e4ndern. Die weitere Nutzung der App gilt als Zustimmung.

12. Online-Streitbeilegung

Die Europ\u00e4ische Kommission stellt eine Plattform zur Online-Streitbeilegung bereit: https://ec.europa.eu/consumers/odr

13. Anwendbares Recht

Diese AGB unterliegen deutschem Recht. Gerichtsstand ist Freiburg im Breisgau.

14. Kontakt

GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}
E-Mail: ${LEGAL_OPERATOR.email}`,
  },

  impressum: {
    en: `Impressum (Legal Notice)

Information according to \u00a7 5 TMG

GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}, Germany

Contact

Email: ${LEGAL_OPERATOR.email}

Responsible for content according to \u00a7 55 Abs. 2 RSt V

${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}, Germany

Disclaimer

Liability for Content
The contents of this app were created with the utmost care. However, we cannot guarantee the accuracy, completeness, or timeliness of the content.

Liability for Links
Our app contains links to external third-party websites over whose content we have no influence.

Market Prices
Market prices displayed in the app are estimates based on publicly available data (TCGplayer, Scryfall, YGOPRODeck). We assume no liability for the accuracy of this price data.

AI Recognition
AI-powered card recognition and condition assessment are automated estimates. They do not replace professional evaluation or authentication.

Online Dispute Resolution

The European Commission provides an online dispute resolution platform: https://ec.europa.eu/consumers/odr

Copyright

Content and works created by the operator of this app are subject to German copyright law. Card images and data are provided by third-party APIs and belong to their respective rights holders.`,

    de: `Impressum

Angaben gem\u00e4\u00df \u00a7 5 TMG

GSI Digital
${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}

Kontakt

E-Mail: ${LEGAL_OPERATOR.email}

Verantwortlich f\u00fcr den Inhalt nach \u00a7 55 Abs. 2 RStV

${LEGAL_OPERATOR.name}
K\u00f6nigschaffhauser Stra\u00dfe 18a
${LEGAL_OPERATOR.city}

Haftungsausschluss

Haftung f\u00fcr Inhalte
Die Inhalte dieser App wurden mit gr\u00f6\u00dfter Sorgfalt erstellt. F\u00fcr die Richtigkeit, Vollst\u00e4ndigkeit und Aktualit\u00e4t der Inhalte k\u00f6nnen wir jedoch keine Gew\u00e4hr \u00fcbernehmen.

Haftung f\u00fcr Links
Unsere App enth\u00e4lt Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben.

Marktpreise
Die in der App angezeigten Marktpreise sind Sch\u00e4tzungen auf Basis \u00f6ffentlich verf\u00fcgbarer Daten (TCGplayer, Scryfall, YGOPRODeck). Wir \u00fcbernehmen keine Gew\u00e4hr f\u00fcr die Richtigkeit dieser Preisdaten.

KI-Erkennung
Die KI-gest\u00fctzte Kartenerkennung und Zustandsbewertung sind automatisierte Sch\u00e4tzungen. Sie ersetzen keine professionelle Bewertung oder Echtheitspr\u00fcfung.

Online-Streitbeilegung

Die Europ\u00e4ische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: https://ec.europa.eu/consumers/odr

Urheberrecht

Die durch den Betreiber dieser App erstellten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Kartenbilder und -daten werden von Drittanbieter-APIs bereitgestellt und geh\u00f6ren den jeweiligen Rechteinhabern.`,
  },
};
