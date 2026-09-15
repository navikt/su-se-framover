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

## Historisk Infotrygd-sak

På saksoversikten gjøres et historisk personoppslag bare for alderssaker. En
vellykket respons som bekrefter historisk alderssak, viser knappen
«Infotrygd sak» foran «Adressesjekk». Knappen åpner en egen Infotrygd-rute.

Vedtaksperiodene lastes først når Infotrygd-ruten åpnes. Siden viser alle
periodene kronologisk, med eksplisitt tom-, laste- og feiltilstand. Tolkede
verdier for behandlingstype, resultat og bosituasjon brukes i visningen;
råverdien er fallback når backend ikke har kunnet tolke feltet. Frontendens
betingede visning er bare UX-styring. Backend håndhever rolle og persontilgang.

Hvert vedtak vises først som en selvstendig boks med all vedtaksinformasjon.
Boksen har et eget nedtrekk for månedsbeløp. Først når nedtrekket åpnes, hentes
vedtakets månedsbeløpsperioder med `vedtakId`. Detaljvisningen viser fra-og-med,
til-og-med, sats, fradrag, beregnet beløp og eventuell linje-ID, med egne laste-,
feil- og tomtilstander.

Drift-siden har i tillegg et synlig, manuelt personoppslag for historisk stønad
eller vedtak fra Infotrygd. Oppslaget bruker først finnes-ruten og navigerer ved
treff til den samme historikkvisningen under `/drift/infotrygd/`.
Fødselsnummeret overføres i navigasjonsstate og inngår ikke i URL-en. Ved
manglende eller ugyldig state gjøres ikke periodeoppslaget; brukeren får en
forklaring og kan søke opp personen på nytt på historikkruten.

Flyten er `cross-repo`-verifisert 2026-09-15 mot frontendimplementasjonen og
`su-se-bakover@21753fff73cf2d35f2b78ab1ad12417ef3fe5fd3`.

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
- `src/api/historiskAlderssakApi.ts`
- `src/types/HistoriskAlderssak.ts`
- `src/pages/drift/index.tsx`
- `src/features/historiskAlderssak/HistoriskAlderssakVisning.tsx`
- `su-se-bakover@21753fff73cf2d35f2b78ab1ad12417ef3fe5fd3`
