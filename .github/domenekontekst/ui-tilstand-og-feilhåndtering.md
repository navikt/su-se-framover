# UI-tilstand og feilhåndtering

## Verifisert strategi

Asynkrone operasjoner modelleres gjennomgående med
`RemoteData<ApiError, T>`. Typiske mønstre er:

- `RemoteData.fold` for hele side- eller seksjonsinnhold
- `Button loading={RemoteData.isPending(...)}` når et skjema skal forbli synlig
- `ApiErrorAlert` for sentral, norsk feilpresentasjon
- Redux Toolkit-slices for delt state
- `useApiCall` og lokal state for avgrensede komponentoperasjoner

## Avtalte teamregler

- Håndter `initial`, `pending`, `failure` og `success` eksplisitt.
- Ikke representer samme operasjon med både `RemoteData` og en separat
  `isLoading`-boolean.
- Vis en eksplisitt tomtilstand når fravær ellers kan oppfattes som lasting,
  teknisk feil eller feil filter.
- Bevar brukerens kontekst ved handlingsfeil; ikke erstatt hele skjemaet med en
  generisk feil dersom handlingen kan prøves igjen.
- Vis backendens avvisning selv om lokal validering godkjente input.
- Ved mulig utdatert state: hent oppdatert data eller gi en forståelig beskjed,
  fremfor å late som operasjonen lyktes.

En tom samling trenger ikke egen tekst når konteksten allerede gjør tomheten
entydig.

## Kilder

- `src/redux/utils.ts`
- `src/lib/hooks.ts`
- `src/components/apiErrorAlert/`
- `src/components/hentOgVisJournalposter/HentOgVisJournalposter.tsx`
- `src/pages/saksbehandling/Saksoversikt.tsx`
- `src/pages/klage/`
- `src/features/`
