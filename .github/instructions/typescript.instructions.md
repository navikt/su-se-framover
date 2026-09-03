---
applyTo: "**/*.{ts,tsx}"
---

# TypeScript- og React-instruksjoner

Disse reglene gjelder TypeScript- og React-filer. Følg også
[`../../AGENTS.md`](../../AGENTS.md).

## Harde regler

- Koden skal passere repositoryets `strict` TypeScript-oppsett og aktive
  Biome-regler. Ikke omgå feil med `any`, brede type assertions eller
  deaktivering av regler.
- Bevar én sentral HTTP-grense gjennom `src/api/apiClient.ts`. Ikke kall
  `su-se-bakover` direkte utenom BFF-en.
- Ikke eksponer eller logg access-token, OBO-token, client secret eller sensitive
  personopplysninger.
- Behandle `401` fra BFF-ens egen auth-utfordring separat fra `401`/`403` som
  proxes fra backend. Ikke innfør automatisk relogin for alle backendfeil.
- Skjult eller deaktivert UI skal aldri beskrives som tilgangskontroll.

## Teamregler

### API-kontrakter og runtime-validering

- TypeScript-typer alene validerer ikke JSON. Sammenlign endrede frontendtyper med
  gjeldende DTO eller endepunkt i `su-se-bakover` når kontrakten krysser
  repositorygrensen.
- Bruk målrettet runtime-validering når data kommer fra en særlig utsatt grense:
  feilrespons med ukjent kropp, runtime-konfigurasjon, URL eller lagring i
  nettleseren, tredjepart, eller en kontrakt der feil form kan gi uriktig
  saksbehandling.
- Bruk `unknown` og en smal decoder eller type guard. `io-ts` er installert, men
  ikke etablert i gjeldende kode; innføring som generell kontraktstrategi krever
  en egen beslutning.
- Et API-avvik skal gi en eksplisitt feiltilstand. Ikke bruk en
  suksessformet fallback.

### Asynkrone tilstander

- Bruk `RemoteData<ApiError, T>` for relevante asynkrone operasjoner og håndter
  `initial`, `pending`, `failure` og `success` eksplisitt.
- For side- og seksjonsinnhold kan `RemoteData.fold` brukes. For handlinger som
  skal beholde skjemaet montert, bruk `loading` på Aksel-knappen og synlig
  `ApiErrorAlert`.
- Ikke kombiner en separat `isLoading`-boolean med samme operasjon i `RemoteData`.
- Vis en eksplisitt tomtilstand når brukeren ellers kan tro at lasting feilet,
  data mangler eller et filter ikke virket.
- Håndter at backend avviser utdaterte eller ugyldige operasjoner; ikke anta at
  visningen fortsatt representerer gjeldende domenetilstand.

### State og skjema

- Hold kortlivet, komponentlokal UI-state lokalt. Bruk Redux Toolkit når state
  deles mellom ruter eller komponenttrær, inngår i en tverrgående flyt eller må
  samordnes med eksisterende domene-state.
- Bruk repositoryets typede Redux-hooks og eksisterende thunk-/slice-mønstre.
- Bruk React Hook Form og Yup via repositoryets valideringsoppsett for flerfelts-
  og domeneskjemaer. Enkle, lokale inputs kan bruke enklere lokal state.
- Servervalidering og lokal validering har ulike ansvar. Vis backendens avvisning
  selv om skjemaet bestod lokal validering.
- Bruk `!` bare etter at Yup-validering, en type guard eller en eksplisitt
  runtime-sjekk har etablert at verdien finnes. Ellers skal typen snevres inn eller
  modelleres riktigere.

### React, komponenter og Aksel

- Gjenbruk eksisterende komponenter, hooks og mappingfunksjoner før du lager en
  ny variant.
- Hold routedata og sidekomposisjon i `src/pages`, tverrgående domenefunksjonalitet
  i `src/features` og gjenbrukbare, avgrensede byggesteiner i `src/components`.
  Følg den nærmeste etablerte strukturen når dagens kode avviker.
- Bruk Aksel-komponenter, ikoner og tokens fremfor egenimplementert interaksjon
  eller kopierte designverdier.
- Bevar semantisk HTML, etiketter, tastaturbruk, synlig fokus,
  fokusflytting ved behov, tilgjengelige navn og forståelig norsk feiltekst.
  Biomes a11y-regler er minimumskontroll, ikke full WCAG-verifikasjon.

## Gjeldende strategi, ikke bindende regel

- `fp-ts` brukes pragmatisk til blant annet `pipe`, `Eq`, `Option` og
  `RemoteData`; repositoryet bruker ikke en gjennomgående `TaskEither`-arkitektur.
- API-suksessvar typekastes i dag sentralt uten generell runtime-dekoding.
- React 19-mønstre er delvis innført. Ikke gjennomfør bred modernisering i en
  ellers avgrenset endring.
- Jest-oppsettet dekker primært rene funksjoner og har ikke etablert
  komponenttestoppsett.

## Relevant kontroll

Kjør bare kontrollene som dekker endringen:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run build:server
```

Bruk `npm run build:server` for BFF-endringer og `npm run build` for endringer som
påvirker Vite-bygget.
