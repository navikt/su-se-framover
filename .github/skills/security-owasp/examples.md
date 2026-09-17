# OWASP-eksempler for TypeScript, Node.js og frontend

## Tilgangskontroll

```tsx
// Feil: UI-et er eneste tilgangskontroll.
const kanGodkjenne = roller.includes('Attestant');
return kanGodkjenne ? <GodkjennKnapp /> : null;

// Riktig: UI-et veileder, mens backend avgjør om handlingen er tillatt.
const resultat = await apiClient({ url: '/vedtak/godkjenn', method: 'POST' });
if (resultat.type === 'failure') {
    visForståeligFeil(resultat.error);
}
```

## Sikker konfigurasjon

```ts
// Feil: alle origins tillates.
app.use(cors({ origin: '*' }));

// Riktig: bruk eksplisitt konfigurert origin.
app.use(cors({ origin: Config.server.host }));
```

## Forsyningskjede

```json
{
    "dependencies": {
        "pino": "10.3.1"
    }
}
```

Bruk eksakte versjoner, gjennomgå låsefilendringer og kjør `npm ci` i
automatisering.

## Hemmeligheter

```ts
// Feil: hemmelighet hardkodes eller eksponeres som frontend-konfigurasjon.
const clientSecret = 'secret';

// Riktig: hemmeligheten leses og brukes bare på serveren.
const clientSecret = process.env.AZURE_APP_CLIENT_SECRET;
```

## Input og rendering

```tsx
// Feil: rå HTML fra bruker eller ekstern tjeneste rendres direkte.
return <div dangerouslySetInnerHTML={{ __html: kommentar }} />;

// Riktig: React escaper tekstinnhold.
return <div>{kommentar}</div>;
```

## Logging

```ts
// Feil: request body kan inneholde fødselsnummer eller andre personopplysninger.
logger.info({ body: req.body }, 'Oppretter vedtak');

// Riktig: stabil melding og eksplisitt valgte, ikke-sensitive felt.
logger.info({ correlationId: req.id }, 'Oppretter vedtak');
```

## Feilhåndtering

```ts
// Feil: stack trace sendes til klienten.
res.status(500).json({ error: err.stack });

// Riktig: detaljene logges på serveren og klienten får en generell feil.
logger.error({ err, correlationId: req.id }, 'Route feilet');
res.status(500).json({ message: 'Internal server error' });
```
