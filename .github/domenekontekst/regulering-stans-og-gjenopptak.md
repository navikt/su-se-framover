# Regulering, stans og gjenopptak

> Kildestatus: `verified` mot frontendkode. Faglige overgangsregler er ikke
> `cross-repo`-verifisert med mindre det står eksplisitt.

## Regulering

Frontend har oversikt over reguleringsstatus, opprettelse og behandling av
manuell regulering, beregning, attestering, godkjenning, underkjenning og
avslutning. Frontendtypen skiller reguleringstyper og flere
reguleringsstatuser.

UI-et skal presentere backendens konkrete resultat og skille:

- automatisk og manuell regulering
- fullført regulering og behov for videre behandling
- pågående behandling og feil

Uavklarte reguleringsregler skal ikke hardkodes i frontend.

## Stans og gjenopptak

`src/types/Sak.ts` har den eksplisitte egenskapen
`utbetalingerKanStansesEllerGjenopptas`, med verdiene `STANS`, `GJENOPPTA` og
`INGEN`. Frontend har separate ruter, sider og API-operasjoner for stans og
gjenopptak.

Dette verifiserer at stans og gjenopptak er separate flyter i frontend. Stans
skal ikke omtales som opphør. Backend avgjør om operasjonen er gyldig; feltet i
sakresponsen brukes til presentasjon og er ikke en autorisasjonskontroll.

## Brev

Frontendmodellene viser egne brevvalg i enkelte revurderingsflyter, men en
generell påstand om at regulering, stans eller gjenopptak alltid eller aldri
sender brev krever kontroll av den konkrete backendflyten.

## Kilder

- `src/types/Sak.ts`
- `src/types/Regulering.ts`
- `src/api/reguleringApi.ts`
- `src/api/revurderingApi.ts`
- `src/pages/saksbehandling/regulering/`
- `src/pages/saksbehandling/regulering/ReguleringAttestering.tsx`
- `src/pages/saksbehandling/stans/`
- `src/pages/saksbehandling/gjenoppta/`
