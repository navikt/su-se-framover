# Brukerflyter

> Kildestatus: `verified` mot frontendkode. Påstander er ikke `cross-repo` med
> mindre det står eksplisitt.

## Verifiserte hovedinnganger

`src/Root.tsx` kobler ruter til disse hovedflytene:

- søke etter sak og åpne saksoversikt
- opprette og fylle ut søknad for alder eller uføre
- behandle søknad, revurdering og vedtak
- attestere eller underkjenne behandlinger
- stanse eller gjenoppta utbetaling
- gjennomføre manuell regulering
- opprette og behandle klage
- opprette og behandle tilbakekreving
- vise og distribuere dokumenter
- registrere kontrollsamtale og kontrollnotat
- utføre avgrensede driftsoppgaver
- bruke en utviklerverktøyrute som oppretter testdata gjennom `/dev`-endepunkter

`/devTools` er registrert uten en synlig rolle- eller miljøgate i
`src/Root.tsx`. Backend må derfor være autoritativ for om endepunktene er
tilgjengelige. Produksjonsavgrensningen er ikke verifisert i dette repoet.

`src/types/Sak.ts` definerer `Sakstype` med medlemmene `Alder` og `Uføre`, som
har wire-verdiene `'alder'` og `'uføre'`. Bruk `Sakstype.Alder` og
`Sakstype.Uføre`, ikke strengliteraler i store bokstaver. URL-tema bruker
`'alder'` og `'ufore'`. Backendens enum-medlemmer heter `ALDER` og `UFØRE`, men
wire-kontrakten er lowercase. Dette er `cross-repo`-verifisert mot
`navikt/su-se-bakover` sin default branch 2026-09-04.

## Kontroll av en flyt

Ved endringer skal flyten undersøkes samlet:

1. Les ruten og siden som er inngang.
2. Finn frontendtypen og backendstatusen som vises.
3. Finn API-operasjonene siden tilbyr.
4. Finn betingelsene som viser eller skjuler handlinger.
5. Kontroller loading, feil, tomtilstand og hva som skjer ved avvist operasjon.
6. Kontroller at begreper og mikrotekst beskriver backendresultatet presist.
7. Kontroller tastaturrekkefølge, fokus og skjermleserinformasjon.

## Ansvarsgrense

Frontend kan bruke backendstatus til å velge riktig presentasjon. Backend er
likevel autoritativ for gjeldende tilstand, gyldige overganger og tilgang. UI-et
skal derfor håndtere at en handling som var synlig, blir avvist fordi data er
utdatert eller tilgangen er endret.

## Kilder

- `src/Root.tsx`
- `src/lib/routes.ts`
- `src/pages/`
- `src/types/Sak.ts`
