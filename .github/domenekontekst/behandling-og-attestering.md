# Behandling og attestering

> Kildestatus: `verified` mot frontendkode. Operasjonenes faglige gyldighet er
> ikke `cross-repo`-verifisert med mindre det står eksplisitt.

## Verifisert frontendmodell

Frontend har separate typer og sider for søknadsbehandling og revurdering.
Statusene brukes til å velge steg, oppsummering og tilgjengelige handlinger.

API-klientene viser at disse operasjonene finnes:

- søknadsbehandling: beregne, simulere, velge brev, sende til attestering,
  returnere, iverksette og underkjenne
- revurdering: oppdatere, beregne og simulere, forhåndsvarsle, velge brev, sende
  til attestering, returnere, underkjenne, iverksette og avslutte

`src/pages/saksbehandling/attestering/` har egne visninger for
søknadsbehandling, revurdering, klage og tilbakekreving.

## Frontendansvar

- Presenter backendens faktiske status og resultat.
- Vis bare handlinger som gir mening for den viste statusen og rollen.
- Behandle en avvisning fra backend som autoritativ, også når handlingen var
  synlig i UI-et.
- Ikke vedlikehold en separat, forenklet tilstandsmaskin som kan drive fra
  backend.
- Skill returnering til saksbehandler, underkjenning ved attestering og
  iverksettelse i tekst og UI.

## Ikke frontendansvar

Frontend skal ikke avgjøre om en overgang er faglig eller juridisk gyldig.
Frontend skal heller ikke implementere beregningsmotoren eller gjøre en skjult
knapp til autorisasjonskontroll.

## Kilder

- `src/types/Søknadsbehandling.ts`
- `src/types/Revurdering.ts`
- `src/api/behandlingApi.ts`
- `src/api/revurderingApi.ts`
- `src/pages/saksbehandling/attestering/`
- `src/pages/saksbehandling/søknadsbehandling/`
- `src/pages/saksbehandling/revurdering/`
