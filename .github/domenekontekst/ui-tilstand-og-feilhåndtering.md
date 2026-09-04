# UI-tilstand og feilhåndtering

> Kildestatus: `verified` mot representative frontendflyter. Påstander er ikke
> `cross-repo` med mindre det står eksplisitt.

## Gjeldende strategi

Asynkrone operasjoner modelleres bredt i eksisterende kode med
`RemoteData<ApiError, T>`. Typiske mønstre er:

- `RemoteData.fold` for hele side- eller seksjonsinnhold
- `Button loading={RemoteData.isPending(...)}` når et skjema skal forbli synlig
- `ApiErrorAlert` for sentral, norsk feilpresentasjon
- Redux Toolkit-slices for delt state
- `useApiCall` og lokal state for avgrensede komponentoperasjoner

## Relevant styring

Normative regler for `RemoteData`, loading, feil og tomtilstand ligger i
[`typescript.instructions.md`](../instructions/typescript.instructions.md).
Denne filen dokumenterer bare dagens mønstre og domenekonteksten de brukes i.

## Kilder

- `src/redux/utils.ts`
- `src/lib/hooks.ts`
- `src/components/apiErrorAlert/`
- `src/components/hentOgVisJournalposter/HentOgVisJournalposter.tsx`
- `src/pages/saksbehandling/Saksoversikt.tsx`
- `src/pages/klage/`
- `src/features/`
