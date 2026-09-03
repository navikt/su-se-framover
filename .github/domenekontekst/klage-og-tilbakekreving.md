# Klage og tilbakekreving

## Klage

Frontend har egne typer, ruter og sider for å opprette klage, vurdere formkrav,
gjøre klagevurdering, velge brevtekst, sende til attestering, ferdigstille,
oversende, iverksette avvist klage, underkjenne og avslutte.

`src/types/Klage.ts` inneholder egne statuser og steg. De skal behandles som en
egen flyt, ikke som statuser i søknadsbehandling.

## Tilbakekreving

Frontend har egne typer og sider for opprettelse, vurdering, forhåndsvarsel,
brevtekst, attestering, iverksetting, underkjenning, avbrytelse,
kravgrunnlagsoppdatering og notat.

Tilbakekreving har egen statusmodell og attestering. UI-et skal bruke statusen
fra backend og håndtere at en operasjon avvises selv om den var synlig.

## Tilgang og presentasjon

Rollebasert visning kan forbedre arbeidsflyten, men backend må håndheve tilgang
til klagen, tilbakekrevingen og operasjonen. Feiltekst skal skille manglende
tilgang fra en faglig ugyldig overgang når backendkontrakten gir grunnlag for
det.

## Kilder

- `src/types/Klage.ts`
- `src/types/ManuellTilbakekrevingsbehandling.ts`
- `src/api/klageApi.ts`
- `src/api/tilbakekrevingApi.ts`
- `src/pages/klage/`
- `src/pages/saksbehandling/tilbakekreving/`
- `src/pages/saksbehandling/attestering/`
