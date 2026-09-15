# API og kontrakter

> Kildestatus: `verified` mot frontendkode. Påstander er ikke `cross-repo` med
> mindre det står eksplisitt.

## Verifisert struktur

`src/api/apiClient.ts` er den sentrale nettleserklienten. Den:

- kaller BFF-en under `/api`
- setter korrelasjons-ID
- representerer resultat som `ApiClientResult<T>`
- håndterer tomme suksessresponser og binære `bodyTransformer`-responser
- typekaster ordinære JSON-suksessvar uten generell runtime-dekoding
- gjør automatisk relogin bare når BFF-en markerer sin egen authutfordring

API-modulene dekker blant annet sak, søknad, behandling, revurdering,
regulering, dokument, klage, tilbakekreving, kontrollsamtale, person, skatt og
driftsoperasjoner.

## Historisk alderssak

`src/api/historiskAlderssakApi.ts` bruker disse personoppslagene:

- `POST /historisk/alderssak/finnes`
- `POST /historisk/alderssak/vedtaksperioder`
- `POST /historisk/alderssak/manedsbelop`

Begge sender bare `{ fnr }`. Frontend sender ikke `importId`, `projeksjonId`
eller `dryRun`; backend velger siste fullførte ordinære projeksjon. Den første
ruten returnerer om en historisk alderssak finnes. Den andre returnerer
historiske vedtaksperioder, der en tom liste betyr at ingen perioder finnes.
Fra Drift brukes finnes-ruten før navigasjon, mens vedtaksperioder først hentes
etter at historikkruten er åpnet.

Månedsbeløpsruten sender bare `{ vedtakId }` og returnerer perioder med
`linjeId`, `fraOgMed`, `tilOgMed`, `sats`, `fradrag` og beregnet `beløp`.
Oppslaget gjøres først når brukeren åpner det aktuelle vedtaket. Et ukjent
vedtak gir `404`; backend finner personidenten fra vedtaket før den håndhever
persontilgang og logger oppslaget.

Frontendtypen bruker backendens tolkede `behandlingstype`, `resultat` og
`bosituasjon`, med de korresponderende råfeltene som fallback ved `null`.
Backend krever Saksbehandler eller Attestant, kontrollerer persontilgang som
alderssak og er autoritativ for `400`, `401` og `403`.

Kontrakten er `cross-repo`-verifisert 2026-09-15 mot
`su-se-bakover@21753fff73cf2d35f2b78ab1ad12417ef3fe5fd3`.

## Sensitive oppslag

`personApi.ts`, `skattApi.ts` og `adresseOppslagApi.ts` eksponerer
person-, skatte- og adresseoppslag gjennom BFF-en. Frontendkoden verifiserer
endepunktene og responsformene, men dokumenterer ikke alene det faglige
grunnlaget, sporingen eller betydningen av operasjoner som
`/skatt/uten-verifisering`. Disse forholdene ligger i
[avklaringer](avklaringer.md).

## Kontraktansvar

Frontendtypene under `src/types/` beskriver forventet responsform, men TypeScript
validerer ikke runtime-JSON. Typene skal speile backendkontrakten;
`su-se-bakover` er fasit for kontrakten og domenebeslutningen. Frontend skal ikke
opprette en konkurrerende kontrakt eller kopiere backendens domeneregler. Når en
kontrakt endres:

1. kontroller endepunkt og DTO i gjeldende `su-se-bakover`
2. oppdater frontendtype, mapping og alle statusgrener samlet
3. vurder målrettet runtime-validering ved utsatte grenser
4. vis kontraktbrudd som feil, ikke som tom eller vellykket respons
5. test eller typekontroller alle berørte konsumenter

Det er ikke et mål å runtime-dekode alle backendresponser. Runtime-validering
brukes målrettet når datagrensen eller konsekvensen gjør det nødvendig.

`io-ts` og `io-ts-types` er installert, men det finnes ingen import i `src/**`.
De er derfor ikke en verifisert generell kontraktstrategi. Dagens konkrete
runtime-validering bruker smale type guards for en backendvalideringsfeil.

## Feilkontrakt

`ApiError` inneholder statuskode, korrelasjons-ID og en forventet feilkropp.
Feiltekst presenteres sentralt gjennom `ApiErrorAlert`. Feilkroppen kan i praksis
være ukjent data og skal valideres før felt brukes i domenelogikk.

## Kilder

- `src/api/apiClient.ts`
- `src/api/`
- `src/types/`
- `src/typeMappinger/`
- `src/api/historiskAlderssakApi.ts`
- `src/types/HistoriskAlderssak.ts`
- `src/pages/søknad/steg/oppsummering/backendValidationUtils.ts`
- `src/components/apiErrorAlert/`
- `su-se-bakover@21753fff73cf2d35f2b78ab1ad12417ef3fe5fd3`
