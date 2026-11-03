# Observerbarhet

> Kildestatus: `verified` mot frontend-, BFF- og konfigurasjonskode.

## Etablert løsning

- Frontendens API-klient sender `X-Correlation-ID`.
- BFF-en bruker Pino og `pino-http`, gjenbruker innkommende korrelasjons-ID og
  setter loggnivå etter HTTP-status.
- `express-http-proxy` viderefører automatisk `X-Su-Error-Logged` fra Bakovers
  respons, ikke fra innkommende request. For 5xx gir verdien `true` loggnivå
  `WARN`, fordi Bakover bekrefter at feilen allerede er logget som `ERROR`.
  Andre verdier og manglende header gir `ERROR`. `proxyErrorHandler` fjerner
  en eventuell kopiert markør ved proxyfeil før svaret sendes. Andre lokale
  feil oppstår uten kopiert markør. Egne 5xx-feil, exceptions og nettverksfeil
  beholder dermed `ERROR`.
- HTTP-logger redigerer request-headere, response-headere og URL. Kjente
  fødselsnummerplasseringer i URL maskeres.
- React-applikasjonen har en `ErrorBoundary` som viser en generell feiltekst og
  utviklerinformasjon fra klientfeilen.
- Enkelte frontendflyter bruker `console.log` eller `console.error`.

Det er ikke verifisert en etablert løsning for distribuert tracing,
browser-telemetri, egne Prometheus-metrikker, Sentry eller et
Grafana-querybibliotek i dette repoet. Slike løsninger og tilhørende skills skal
ikke innføres som del av en vanlig feilretting.

## Grenser

- Ikke logg token, hemmeligheter, fødselsnummer eller andre sensitive
  personopplysninger.
- Bevar korrelasjons-ID gjennom frontend, BFF og backendkall.
- Bruk eksisterende Pino-oppsett for BFF-logging fremfor parallelle loggere.
- Kontroller hva som sendes til logger og hva som vises i nettleseren før
  feilobjekter, responser eller requestdata legges til.
- En ny observability-stack, ekstern eksport eller produksjonstilgang krever en
  eksplisitt beslutning.

## Uavklart

Det er ikke avklart om stack trace i `ErrorBoundary` skal være synlig i alle
miljøer, eller hvilken policy som skal gjelde for eksisterende
`console.log`-bruk. Disse forholdene skal ikke presenteres som vedtatt
observability-strategi.

## Kilder

- `src/api/apiClient.ts`
- `src/components/errorBoundary/ErrorBoundary.tsx`
- `src/features/frontendConfig/useFrontendConfig.ts`
- `server/logger.ts`
- `server/express.ts`
- `server/proxy.ts`
- `server/package.json`
