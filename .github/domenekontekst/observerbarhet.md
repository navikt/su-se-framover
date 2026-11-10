# Observerbarhet

> Kildestatus: `verified` mot frontend-, BFF- og konfigurasjonskode.

## Etablert løsning

- Frontendens API-klient sender `X-Correlation-ID`.
- BFF-en bruker Pino og `pino-http`, gjenbruker innkommende korrelasjons-ID og
  setter loggnivå etter HTTP-status.
- `express-http-proxy` viderefører automatisk `X-Su-Error-Logged` fra Bakovers
  respons, ikke fra innkommende request. For 5xx gir verdien `true` loggnivå
  `WARN` bare når `res.err` mangler, fordi Bakover bekrefter at backendfeilen
  allerede er logget som `ERROR`. En egen BFF-feil i `res.err` gir `ERROR`
  uansett markøren. Andre verdier og manglende header gir `ERROR`. Den felles `errorHandler`
  fjerner en eventuell kopiert markør ved lokale feil før svaret sendes. Andre lokale
  feil oppstår uten kopiert markør. Egne 5xx-feil, exceptions og nettverksfeil
  beholder dermed `ERROR`.
- Express har en felles `errorHandler` etter rutene. Proxyfeil sendes dit med
  `next(err)`, uten separat feillogging eller videresending til Express sin
  tekstbaserte standardlogger. `pino-http` logger feilkode, kontrollert melding,
  korrelasjons-ID og feilkilde når den er kjent. Rå feiltekster, stack traces og
  ekstra felter fra feilobjekter tas ikke med.
- Avvist backendforbindelse gir `503`, brutt forbindelse gir `502`, og timeout
  gir `504`. Uventede proxyfeil gir `500`. Lokale feil med gyldig HTTP-feilstatus
  beholder statusen; andre lokale feil gir `500`. Feil i klientforespørselen
  med status `4xx` logges som `WARN`, mens lokale `5xx` logges som `ERROR`.
- Ufullførte klientforbindelser logges som `WARN`. En etterfølgende proxyfeil
  med `ECONNRESET` eller `EPIPE` etter at klientforbindelsen er avbrutt gir ikke
  en ekstra feillogg. Feil som når håndtereren etter at HTTP-loggeren er ferdig,
  gir heller ingen ekstra logg. Det finnes ingen egen sporing av ferdigloggede
  responser; også uventede feil som kommer så sent, kan derfor mangle i loggen.
- Ved feil etter at svaret er påbegynt avsluttes forbindelsen. Feilhåndtereren
  forsøker ikke å sende en ny feilrespons.
- HTTP-logger redigerer request-headere, response-headere og URL. Kjente
  fødselsnummerplasseringer i URL maskeres.
- React-applikasjonen har en `ErrorBoundary` som viser en generell feiltekst og
  utviklerinformasjon fra klientfeilen.
- Enkelte frontendflyter bruker `console.log` eller `console.error`.

Det er ikke verifisert en etablert løsning for distribuert tracing,
browser-telemetri, egne Prometheus-metrikker, Sentry eller et
Grafana-querybibliotek i dette repoet. Slike løsninger og tilhørende skills skal
ikke innføres som del av en vanlig feilretting.

## Fra feil til logg i BFF-en

BFF betyr her Express-serveren mellom nettleseren og `su-se-bakover`.
`errorHandler` håndterer feilresponsen og forbindelsen. `httpLogger`
(`pino-http`) logger utfallet i BFF-en; den sender ikke feilresponser.

I `server/express.ts` registreres HTTP-loggeren før proxyen og rutene, mens
feilhåndtereren registreres etter dem:

```text
Forespørsel kommer inn i BFF-en
    |
    +--> httpLogger registrerer lyttere for avslutning og lukking
    |
    +--> Proxy eller route behandler forespørselen
             |
             +--> Responsen avsluttes uten en Express-feil
             |        |
             |        +--> httpLogger logger utfallet
             |
             +--> next(err), eller feil fra en Express-route
                      |
                      +--> errorHandler håndterer feilen
                               |
                               +--> Avslutning/lukking utløser HTTP-loggen
```

En HTTP-feilstatus fra backend er ikke i seg selv en Express-feil:

```text
Backend svarer 503 med X-Su-Error-Logged: true
    |
    +--> Proxyen videresender svaret, uten å sette res.err
    +--> BFF-ens HTTP-logger velger WARN

Proxykallet feiler med ECONNREFUSED
    |
    +--> proxyErrorHandler lager RequestError med status 503
    +--> next(err) sender feilen til errorHandler
    +--> errorHandler setter res.err og sender feilrespons
    +--> BFF-ens HTTP-logger velger ERROR
```

`X-Su-Error-Logged` betyr at backend allerede har logget backendfeilen.
Det betyr ikke at backend har logget en ny feil som oppstår i BFF-en.

### Hva `safeError` og `res.err` betyr

`RequestError` er vårt feilformat med status, feilkode, kontrollert melding og
feilkilde. `requestError(error)` beholder en eksisterende `RequestError`.
Andre feil får en gyldig HTTP-feilstatus fra `status` eller `statusCode`, ellers
`500`. Meldingen hentes fra standard HTTP-beskrivelser, ikke rå feiltekst.
`safeError` er variabelnavnet for resultatet, ikke en egen feiltype.

`res` er responsobjektet for ett kall. `res.err = safeError` lagrer feilen på
objektet i BFF-ens minne, slik at HTTP-loggeren kan lese den senere. Denne
tilordningen logger ingenting, sender ingenting og avslutter ingenting.
Feltet er ikke en HTTP-header og sendes ikke til nettleseren.

### Stegene i `errorHandler`

Stegene følger rekkefølgen i `server/errorHandler.ts`. Hver `return` avslutter
feilhåndtereren; linjene nedenfor kjøres da ikke.

1. **Gjør feilen om til vårt format.** `requestError(error)` gir `safeError`.
2. **Konsumer forventet proxyfeil etter avbrudd.** Hvis responsen er uferdig,
   forespørselen er avbrutt eller responsen er ødelagt, og proxyfeilen er
   `ECONNRESET` eller `EPIPE`, avsluttes eventuell gjenværende forbindelse.
   Håndtereren returnerer uten å sette `res.err` eller skrive en ekstra feillogg.
   HTTP-loggeren har sin egen logg av avbruddet.
3. **Registrer andre feil.** `res.err = safeError` gjør feilen tilgjengelig for
   HTTP-loggeren. Et vanlig backendfeilsvar setter ikke dette feltet.
4. **Ikke skriv til en ødelagt eller ferdig respons.** `res.destroyed` betyr at
   responsen er ødelagt; `res.writableFinished` betyr at serveren er ferdig med å
   skrive den. Håndtereren returnerer uten å sende noe mer til klienten.
   Hvis HTTP-loggen ennå ikke er behandlet, kan den lese `res.err` ved avslutning.
5. **Avbryt en påbegynt, uferdig respons.** `res.headersSent` betyr at vi ikke
   lenger kan erstatte status og headere. `res.destroy()` bryter forbindelsen,
   slik at en ufullstendig respons ikke avsluttes som om den var komplett.
   Lukking utløser HTTP-loggeren, som leser `res.err`.
6. **Send feilrespons bare når ingenting er sendt ennå.** Fjern en eventuell
   forberedt `X-Su-Error-Logged`-header, og send status og kontrollert JSON-melding.
   Headeren kan fjernes her fordi den ennå ikke er sendt. HTTP-loggeren logger
   utfallet når responsen avsluttes.

Responsbehandlingen i steg 4–6 kan tegnes slik:

```text
Feilen er registrert i res.err
    |
    +--> Respons ødelagt eller ferdig skrevet?
    |        JA: Send ingenting mer. Ingen egen feillogg. Returner.
    |            Hvis HTTP-loggeren er ferdig, kommer ingen ny logg.
    |
    +--> Headere allerede sendt, men responsen er uferdig?
    |        JA: Bryt forbindelsen. Returner.
    |            HTTP-loggeren logger feilen ved lukking.
    |
    +--> Ingenting sendt ennå:
             Fjern eventuell forberedt backendmarkør.
             Send den første og eneste feilresponsen.
             HTTP-loggeren logger feilen ved avslutning.
```

Dette endrer ingen timeoutinnstilling. Når feilen allerede er kjent, unngår
steg 5 å la klienten vente på resten av en respons BFF-en ikke kan fullføre.
Håndtereren kaller ikke `next(err)` etter ferdig håndtering. Dermed går feilen
ikke videre til Express sin standardhandler, som ellers skriver en ekstra
tekstlogg med `console.error`.

Håndtereren skriver ingen egen feillogg. Hvis HTTP-loggeren allerede er ferdig,
utløser ikke `res.err = safeError` en ny logg. Dette er en bevisst avgrensning
for å holde løsningen enkel, ikke en garanti for at alle sene feil er logget.

### Avgrensning ved streaming

Steg 5 gjelder bare feil som faktisk når `errorHandler`. Proxybibliotekets
streamingsti bruker `.pipe(...)` uten eksplisitt videresending av feil på
backendens responsstrøm til denne håndtereren. Den delvise responsgrenen er
derfor ikke alene en garanti for håndtering av alle backendbrudd midt i en
strøm. Eksempler med `res.write(...)` fulgt av `next(err)` beskriver
feilhåndtereren, ikke verifisert dekning av hele proxyens streamingflyt.

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
- `server/errorHandler.ts`
- `server/__tests__/errorHandler.test.ts`
- `server/package.json`
