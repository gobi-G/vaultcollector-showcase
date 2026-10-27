# New Edge Function

Erstelle eine neue Supabase Edge Function. Das Argument ist der Funktionsname (z.B. `/edge-function price-alert`).

## Architektur (4 Layer — strikt einhalten)

```
Edge Function (HTTP) → Service (Logic) → Provider/Repository (Data)
```

## Schritte

### 1. Shared Types
- Definiere Request/Response Zod-Schemas in `packages/shared/src/`
- Typen via `z.infer<>` ableiten
- Niemals Typen duplizieren

### 2. Repository (falls DB-Zugriff nötig)
- Erstelle `supabase/repositories/<name>.repository.ts`
- Nur CRUD — keine Business Logic
- Nutze Supabase Client aus `supabase/config/`
- Typen aus `supabase/types/index.ts` (re-exports von shared)

### 3. Provider (falls externe API nötig)
- Erstelle `supabase/providers/<name>.provider.ts`
- Interface zuerst in `supabase/providers/interfaces/I<Name>Provider.ts`
- API-Keys immer aus Environment Variables (`Deno.env.get("KEY")`)
- Fehler-Handling: niemals raw API-Errors nach oben werfen

### 4. Service
- Erstelle `supabase/services/<name>.service.ts`
- Enthält ALLE Business Logic (Tier-Limits, Aggregation, Orchestrierung)
- Erhält Provider/Repository via Dependency Injection (Factory Function)
- Niemals direkter DB-Zugriff im Service

### 5. Edge Function (thin handler)
- Erstelle `supabase/functions/<name>/index.ts`
- Nur: CORS → Auth → Zod-Validation → Service-Call → Response
- Keine Business Logic hier
- Nutze `_shared/`: `corsHeaders`, `authenticateRequest()`, `jsonResponse()`, `errorResponse()`
- Auth prüfen mit `authenticateRequest(req)`

### Template für Edge Function:
```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders, handleCors } from "../_shared/cors.ts";
import { authenticateRequest } from "../_shared/auth.ts";
import { jsonResponse, errorResponse } from "../_shared/response.ts";
import { RequestSchema } from "../../types/index.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return handleCors();

  try {
    const user = await authenticateRequest(req);
    const body = RequestSchema.parse(await req.json());

    const service = createService(); // Factory
    const result = await service.execute(user.id, body);

    return jsonResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
});
```

### 6. Deno Tests
- Erstelle `supabase/services/__tests__/<name>.service.test.ts`
- Teste Business Logic (Tier-Limits, Berechnungen)
- Mocke externe APIs — nie echte API-Calls in Tests
- Nutze `deno test --allow-env --allow-net`

- Erstelle `supabase/providers/__tests__/<name>.provider.test.ts`
- Teste API Response Parsing und Error Handling des Providers
- Mocke HTTP-Responses — nie echte API-Calls

## Regeln
- API Keys NIE im Code — immer `Deno.env.get()`
- `console.error` nur für unerwartete Fehler
- Rate Limiting via shared `rateLimit.ts` Middleware für KI-Features
- RLS muss auf allen DB-Tabellen aktiv sein
- Deploy: `supabase functions deploy <name> --project-ref <ref>`
