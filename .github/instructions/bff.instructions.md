---
applyTo: "server/**/*.ts"
---

# BFF-instruksjoner

Disse reglene gjelder Express-BFF-en. Følg også
[`../../AGENTS.md`](../../AGENTS.md).

## Harde regler

- Koden skal passere `server/tsconfig.json` med `strict` TypeScript.
- Nettleseren skal aldri motta brukerens access-token, OBO-token, client secret
  eller annen serverhemmelighet.
- Ikke logg tokens, secrets eller sensitive personopplysninger.
- Valider innkommende token med signatur, issuer, audience og utløp før OBO.
- Skill en authutfordring som skal gi `401` fra drifts- og
  infrastrukturproblemer som skal gi `5xx`. Ikke gjør JWKS-, nettverks-,
  konfigurasjons- eller generelle OBO-feil om til relogin.
- Bare BFF-ens egen reloginutfordring skal bruke den avtalte
  `x-login-required`-markøren. Backendresponser proxes uten å få markøren.
- Runtime-konfigurasjon til nettleseren skal være eksplisitt allowlistet.

## Teamregler

- Hold kommunikasjon med authleverandøren i `server/auth/` og kommunikasjon med
  `su-se-bakover` i den etablerte proxygrensen.
- Gjenbruk `authenticateUser`, `validateToken` og `requestOboToken`. Ikke lag en
  parallell JWT-validering eller tokenveksling i en feature eller route, og ikke
  innfør TokenX, Oasis eller et nytt auth-bibliotek uten en eksplisitt
  arkitektur- og authbeslutning.
- Bevar eksplisitt timeout, utløpsmargin, cacheopprydding og deduplisering av
  samtidige OBO-kall når tokenflyten endres.
- Skill ugyldig eller uventet respons fra suksess. Ikke bruk
  suksessformede fallbacks eller brede catches som skjuler årsaken.
- Frontendens rollebaserte visning er ikke BFF-autorisasjon. Ikke anta at en
  skjult klienthandling beskytter et endepunkt.

## Relevant kontroll

```sh
npm run typecheck
npm run build:server
```
