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
- `src/pages/søknad/steg/oppsummering/backendValidationUtils.ts`
- `src/components/apiErrorAlert/`
