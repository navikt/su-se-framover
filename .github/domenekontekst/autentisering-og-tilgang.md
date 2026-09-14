# Autentisering og tilgang

> Kildestatus: `verified` mot frontend- og BFF-kode. Backendens egne
> tilgangsavgjørelser er ikke `cross-repo`-verifisert med mindre det står
> eksplisitt.

## Verifisert authflyt

1. Saksbehandleren autentiseres med Entra ID gjennom Wonderwall.
2. Wonderwall legger bearer-token på kall til applikasjonen.
3. BFF-en validerer tokenets signatur, issuer, audience og utløp med `jose`.
4. BFF-en gjør OBO-veksling for målgruppen til `su-se-bakover`.
5. BFF-en proxer `/api` med OBO-tokenet. Tokenet sendes ikke til nettleserkoden.
6. `su-se-bakover` validerer backendtokenet og er autoritativ for roller og
   tilgang til person, sak og operasjon. Håndhevingen må fortsatt kontrolleres
   for det konkrete endepunktet som endres.

Frontend og BFF bruker ikke TokenX eller Oasis. JWT-valideringen og
Azure OBO-vekslingen er allerede implementert i `server/auth/`. Nye ruter og
features skal gjenbruke denne grensen, ikke implementere egen tokenvalidering
eller token exchange.

BFF-en skiller ugyldig eller utløpt brukertoken fra driftsfeil mot
authinfrastruktur. BFF-ens egen `401` markeres med `x-login-required`, og
frontend bruker markøren for relogin. En transparent backend-`401` mangler
markøren og utløser ikke automatisk relogin. Markøren beskriver dagens
implementasjon; den beviser ikke at ny innlogging kan reparere alle årsaker som
klassifiseres som ugyldig token. Operasjonelle validerings- og OBO-feil svarer
med `502` og en avgrenset feilkode.

## Roller og tilgang

Frontendens brukerdata inneholder roller, og enkelte handlinger eller
navigasjonselementer vises etter rolle. Dette er UX-styring.

Rolle er ikke det samme som tilgang til en bestemt person, sak eller operasjon.
Backend er autoritativ. Frontend skal vise `401`/`403` forståelig og ikke anta at
skjult UI sikrer endepunktet.

## Sikkerhetsgrenser

- Ikke logg innkommende token, OBO-token, client secret eller tokenrespons.
- Ikke legg serverens authkonfigurasjon i `/frontend-config`.
- Ikke map alle `401` til relogin.
- Ikke utvid hvilke tokenfeil som markeres for relogin uten å vurdere risiko for
  vedvarende innloggingsloop.
- Ikke gjør en driftsfeil mot JWKS eller tokenendepunktet om til en
  autentiseringsfeil.
- Bevar timeout, utløpsmargin og deduplisering dersom OBO-cachen endres.

## Kilder

- `server/auth/index.ts`
- `server/auth/obo.ts`
- `server/proxy.ts`
- `server/config.ts`
- `src/api/apiClient.ts`
- `src/api/authUrl.ts`
- `src/context/userContext.tsx`
- `src/utils/router/ContentWrapper.tsx`
- `.nais/dev-gcp.yaml`
- `.nais/prod-gcp.yaml`
- `docker-compose.yml`
- `navikt/su-se-bakover#2970` ved head
  `84d987139407c854cd75d0b73118e654de89ec15`
