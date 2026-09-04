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

Backendens Kotlin-, database- og persistensarkitektur er utenfor denne
frontendoversikten.
