# Systemoversikt

> Kildestatus: `verified` mot frontendkode og konfigurasjon. Påstander er ikke
> `cross-repo` med mindre det står eksplisitt.

## Verifisert ansvar

`su-se-framover` består av en React-applikasjon og en Express-BFF.

Flyten i prod er:

1. Wonderwall håndterer innlogging og legger brukerens access-token på kall til
   applikasjonen.
2. BFF-en validerer signatur, issuer, audience og utløp.
3. BFF-en veksler tokenet til et OBO-token for `su-se-bakover`.
4. `/api` proxes til `su-se-bakover` med OBO-tokenet.
5. React-applikasjonen presenterer data og handlinger, men eier ikke
   backendens domeneregler, tilgangsavgjørelser eller tilstandsoverganger.

Lokalt står Wonderwall og en mock OIDC-provider foran Vite, mens Vite proxer
API-kall til BFF-en. `su-se-bakover` må bruke samme lokale issuer for at hele
authflyten skal virke.

## Lag og ansvar

| Lag | Verifisert ansvar |
|---|---|
| `src/Root.tsx` og `src/pages/` | Ruter, sidekomposisjon og brukerflyter |
| `src/components/` og `src/features/` | UI-byggesteiner og domenenær frontendfunksjonalitet |
| `src/redux/` og slices | Delt state og asynkrone operasjoner |
| `src/api/` | Typede klientfunksjoner mot BFF-ens `/api` og den avgrensede BFF-konfigurasjonen |
| `server/auth/` | JWT-validering og OBO-veksling |
| `server/proxy.ts` | Beskyttet proxy til `su-se-bakover` |
| `server/routes.ts` | Runtime-konfigurasjon, statiske filer og health-endepunkter |

Runtime-konfigurasjonen til nettleseren er eksplisitt avgrenset til miljø,
cachebuster og valgfri analysekonfigurasjon. Serverens authhemmeligheter ligger
ikke i responsen.

## Brotli-dekoding av innkommende forespørsler

> Kildestatus: `verified` mot serveroppsettet og installert Express 5.2.1 /
> body-parser 2.3.0 den 27. oktober 2026. Tilgjengelighet gjennom ingress og
> Wonderwall i produksjon er ikke bekreftet.

Brotli følger med Node.js. Applikasjonen trenger ikke å aktivere
Brotli-komprimering av svar for å dekode Brotli-komprimerte forespørsler.
`express.json()` og `express.urlencoded({ extended: true })` i
`server/express.ts` pakker som standard ut innkommende forespørsler
(`inflate: true`).

En avsender kan aktivere `zlib.createBrotliDecompress()` når en forespørsel når
disse parserne og har:

- `Content-Encoding: br`. `Accept-Encoding: br` aktiverer ikke denne dekodingen.
- `Content-Type: application/json` eller
  `application/x-www-form-urlencoded`, med støttet tegnsett, for eksempel UTF-8.
- En kropp med `Content-Length` eller `Transfer-Encoding` som ikke allerede er
  lest av annen middleware.

Parserne kjører før rutene og tokenvalideringen i `server/proxy.ts`. Det betyr
ikke at en anonym avsender kommer gjennom Wonderwall eller ingress.

Den lokale kontrollen brukte små, gyldige Brotli-komprimerte kropper med samme
parseroppsett som applikasjonen. Begge innholdstypene aktiverte dekoderen og ga
forventede data. Kontrollen bekreftet dekoderaktivering, ikke utnyttelse av en
sårbarhet eller tilgjengelighet i produksjon.

Standardgrensen er 102 400 utpakkede byte. Den hindrer ikke at dekoderen starter;
grensen håndheves mens den utpakkede kroppen leses.

Kildepunkter for mekanismen:

- `server/express.ts`: parseroppsett og rekkefølge på middleware.
- `server/package-lock.json`: versjonene av Express og body-parser.
- body-parser 2.3.0, `lib/utils.js`: standardverdier for `inflate` og `limit`.
- body-parser 2.3.0, `lib/read.js`: valg av dekoder fra `Content-Encoding`.
- raw-body, `index.js`: størrelsesgrense under lesing.

For [CVE-2026-111497](https://www.cve.org/CVERecord?id=CVE-2026-111497)
oppdateres Docker-imaget og byggoppsettet fra Node 24.1.0 til 24.22.1, som har
rettelsen ifølge [Nodes sikkerhetsmelding](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).
Oppdateringen beskytter først kjørende applikasjoner når et nytt image er
bygget og deployet.

## Kilder

- `src/Root.tsx`
- `server/auth/index.ts`
- `server/auth/obo.ts`
- `server/proxy.ts`
- `server/routes.ts`
- `server/config.ts`
- `vite.config.ts`
- `docker-compose.yml`
- `.nais/dev-gcp.yaml`
- `.nais/prod-gcp.yaml`
