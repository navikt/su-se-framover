# Utbetaling og simulering

> Kildestatus: `verified` mot frontendkode. Betydningen av nedstrøms statuser er
> ikke `cross-repo`-verifisert med mindre det står eksplisitt.

## Verifisert frontendansvar

Søknadsbehandling har et eget simuleringsendepunkt, og revurdering har en samlet
beregn-og-simuler-operasjon. Frontendtypene inneholder simuleringsresultater og
utbetalingsperioder som presenteres i behandlings- og vedtaksvisninger.

Frontend skal:

- skille beregning fra simulering i tekst og status
- vise simuleringsresultatet uten å reimplementere beregningen
- bevare feiltilstanden dersom simulering eller senere operasjoner avvises
- ikke omtale oversending som bekreftet utbetaling uten en kvittert status som
  underbygger det

Driftssiden har en egen operasjon for å sende utbetalingslinjer. Dette er en
driftsoperasjon og skal ikke brukes som belegg for at ordinær
saksbehandlingsflyt er ferdig utbetalt.

## Delvis verifisert grense

Frontend viser utbetalingsperioder og ulike behandlingsresultater, men
repositoryet alene dokumenterer ikke hele kvitteringskjeden mot
utbetalingssystemet. Betydningen av backendens konkrete utbetalingsstatuser må
verifiseres mot gjeldende backendkontrakt før ny mikrotekst eller styringslogikk
innføres.

## Kilder

- `src/api/behandlingApi.ts`
- `src/api/revurderingApi.ts`
- `src/api/driftApi.ts`
- `src/types/Simulering.ts`
- `src/types/Utbetaling.ts`
- `src/types/Utbetalingsperiode.ts`
- `src/pages/saksbehandling/sakintro/Utbetalinger.tsx`
