# Brev og dokument

> Kildestatus: `verified` mot frontendkode. Betydningen av journalførings- og
> distribusjonsstatuser er ikke `cross-repo`-verifisert med mindre det står
> eksplisitt.

## Verifiserte flater

Frontend støtter:

- valg av brev i søknadsbehandling og revurdering
- forhåndsvisning av vedtaksutkast, revurderingsbrev, forhåndsvarsel,
  avslutningsbrev, klagebrev og søknadsavslag
- visning av interne og eksterne dokumenter
- journalposter og dokumentmetadata
- eksplisitt distribusjon av enkelte dokumenter
- mottakeroppslag og endring for avgrensede brevtyper

At et brev kan forhåndsvises, lagres eller bestilles betyr ikke automatisk at det
er journalført eller distribuert. UI-et skal bruke den konkrete statusen fra
backend og skille handlingene i tekst.

## Ansvarsgrense

Frontend velger og presenterer. Backend eier generering, lagring, journalføring
og distribusjonsoperasjoner. Påstanden om hvilke behandlingstyper som sender
vedtaksbrev må kontrolleres mot gjeldende endepunkt og flyt før den brukes som
generell regel.

## Kilder

- `src/api/pdfApi.ts`
- `src/api/dokumentApi.ts`
- `src/api/mottakerClient.ts`
- `src/api/fritekstApi.ts`
- `src/types/dokument/`
- `src/pages/saksbehandling/brev/`
- `src/pages/saksbehandling/dokumenter/`
- `src/pages/drift/components/dokument/`
