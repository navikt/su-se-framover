---
name: security-owasp
description: OWASP Top 10:2025-mønstre for TypeScript, Node.js og frontend — tilgangskontroll, forsyningskjede, inputvalidering og feilhåndtering
license: MIT
metadata:
  domain: auth
  tags: security owasp typescript nodejs frontend nais supply-chain
---

# OWASP Top 10:2025 for TypeScript, Node.js og frontend

Bruk skillen til sikkerhetsvurderinger i React-klienten og Express-BFF-en. Lokale
regler i `AGENTS.md` og `.github/instructions/` har forrang.

Se `examples.md` for korte TypeScript-eksempler.

## Tilgangskontroll og SSRF

```ts
// Ikke stol på at skjult UI beskytter handlingen.
app.post('/api/handling', authenticateUser, async (req, res) => {
    const result = await backendClient.execute(req.body);
    res.json(result);
});
```

- Backend er autoritativ for tilgang og domenetilstander.
- Valider mål for utgående kall mot en eksplisitt allowlist.
- Bruk Nais `accessPolicy.outbound` som ekstra vern.
- Valider tokenets signatur, issuer, audience, utløp og godkjent algoritme.

## Sikker konfigurasjon

```ts
app.use(
    cors({
        origin: Config.server.host,
        allowedHeaders: ['Origin', 'Content-Type', 'Accept', 'X-Requested-With'],
    }),
);
```

- Begrens CORS til kjente origins, metoder og headere.
- Ikke eksponer debug- eller administrasjonsendepunkter på offentlig ingress.
- Send generiske feil til klienten; behold interne detaljer i serverlogger.
- Eksponer bare eksplisitt allowlistet runtime-konfigurasjon til nettleseren.

## Forsyningskjede

```json
{
    "dependencies": {
        "pino": "10.3.1"
    }
}
```

- Bruk eksakte pakkeversjoner og commit låsefilen.
- Bruk `npm ci` i automatisering.
- Behold repositoryets vern mot lifecycle-scripts og ferske pakker.
- Vurder vedlikehold, eierskap og transitive endringer før nye pakker tas inn.

## Hemmeligheter og kryptografi

```ts
const clientSecret = process.env.AZURE_APP_CLIENT_SECRET;
if (!clientSecret) {
    throw new Error('Missing AZURE_APP_CLIENT_SECRET');
}
```

- Les hemmeligheter fra servermiljøet; aldri hardkod dem eller send dem til nettleseren.
- Ikke slå av TLS-verifisering.
- Bruk plattform- og standardbiblioteker fremfor egen kryptografi.

## Input og output

```ts
const parsed = schema.validateSync(req.body, { abortEarly: false, stripUnknown: true });
```

- Valider utsatte datagrenser med repositoryets etablerte valideringsverktøy.
- Send brukerinput som data, aldri som kode, shellkommando eller rå HTML.
- Bruk Reacts vanlige escaping og unngå `dangerouslySetInnerHTML`.
- Begrens requeststørrelse og filopplasting etter faktisk behov.

## Logging og personvern

```ts
logger.error({ err, correlationId }, 'Kall mot tjeneste feilet');
```

- Ikke logg tokens, hemmeligheter, fødselsnummer, navn, adresser eller rå request bodies.
- Bruk stabile meldinger og strukturerte, ikke-sensitive felt.
- Bevar korrelasjons-ID gjennom klient, BFF og backendkall.
- Logg faktiske `Error`-objekter når stack og feiltype trengs.

## Feilhåndtering

```ts
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    logger.error({ err }, 'Unhandled BFF error');
    res.status(500).json({ message: 'Internal server error' });
});
```

- Ikke svelg exceptions eller avviste promises.
- Skill forventede klientfeil fra driftsfeil.
- Ikke gjør infrastruktur- eller authleverandørfeil om til relogin.
- Returner forståelige, men generiske feil uten stack eller intern konfigurasjon.

## Sjekkliste

- [ ] Backend håndhever tilgang og gyldige domenetilstander.
- [ ] CORS og utgående nettverk er eksplisitt begrenset.
- [ ] Pakkeversjoner er eksakte og låsefilen er gjennomgått.
- [ ] Hemmeligheter forblir på serveren.
- [ ] Eksterne data valideres ved utsatte grenser.
- [ ] Logger inneholder ikke tokens eller personopplysninger.
- [ ] Feilobjekter logges strukturert, mens klientresponsen er generell.
- [ ] UI har semantisk HTML, tastaturstøtte og forståelige feiltekster.

## Grenser

Spør før du endrer autentisering, autorisasjon, kryptografi, utgående eksterne
verter eller repositoryets supply-chain-vern.
