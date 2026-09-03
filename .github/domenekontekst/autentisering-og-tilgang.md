# Autentisering og tilgang

## Verifisert authflyt

1. Wonderwall håndterer innlogging og sesjon.
2. Wonderwall legger bearer-token på kall til applikasjonen.
3. BFF-en validerer tokenets signatur, issuer, audience og utløp med `jose`.
4. BFF-en gjør OBO-veksling for målgruppen til `su-se-bakover`.
5. BFF-en proxer `/api` med OBO-tokenet. Tokenet sendes ikke til nettleserkoden.

BFF-en skiller ugyldig eller utløpt brukertoken fra driftsfeil mot
authinfrastruktur. Bare BFF-ens egen `401` markeres med
`x-login-required`. Frontend bruker denne markøren for relogin, slik at en
transparent backend-`401` ikke lager innloggingsloop. Operasjonelle
validerings- og OBO-feil svarer med `502` og en avgrenset feilkode.

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
