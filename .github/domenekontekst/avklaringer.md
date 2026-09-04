# Avklaringer

Denne filen holder uavklarte, historiske og avkreftede påstander unna gjeldende
fakta og regler.

## Uavklart

| Påstand eller spørsmål | Hvorfor uavklart | Krever |
|---|---|---|
| Uberørte frontendtyper samsvarer med gjeldende DTO-er i `su-se-bakover` | En full DTO-audit er ikke en fast forhåndskontroll og blir raskt utdatert | Verifiser den berørte kontrakten behovsstyrt mot en eksplisitt backend-ref |
| `io-ts` skal være generell kontraktstrategi | Pakkene er installert, men brukes ikke i `src/**` | Egen beslutning og migreringsplan; inntil da brukes målrettede guards/decodere |
| Alle reguleringer ender i én av et fast sett forretningsutfall | Frontend har flere statuser, men faglig uttømmende betydning eies av backend | Gjeldende backendkode og faglig kilde |
| Regulering, stans og gjenopptak sender aldri vedtaksbrev | Frontend viser egne brevvalg i deler av revurderingsflyten, men beviser ikke en generell regel | Kontroll av hver backendflyt |
| Oversendt utbetaling er ferdig utbetalt | Frontend viser deler av kjeden, men eier ikke ekstern kvittering | Backendkontrakt og statuskilde |
| Gjenopptak er alltid faglig tillatt etter stans | Frontend bruker `utbetalingerKanStansesEllerGjenopptas` som presentasjonsgrunnlag | Backendens gyldighetsregel og tilgangskontroll |
| React 19 `ref` som prop skal erstatte all `forwardRef` | Begge mønstre finnes i kodebasen | Egen teknisk beslutning |
| Importstil for `fp-ts` skal standardiseres | Både `fp-ts/X`, `fp-ts/lib/X` og en lokal facade brukes | Egen oppryddingsbeslutning |
| Component testing skal være obligatorisk | Jest-oppsettet har ikke etablert DOM-/komponenttestmiljø | Beslutning om testverktøy og supply-chain-vurdering |
| Ny innlogging reparerer alle tokenfeil som BFF-en markerer med `x-login-required` | Dagens validering markerer flere ugyldig-token-kategorier; enkelte kan skyldes vedvarende konfigurasjons- eller nøkkelavvik | Tester og eventuell finere klassifisering i `server/auth/index.ts` |
| Hvert backendendepunkt håndhever alle dokumenterte tilgangs- og overgangsgrenser | Frontend skal anta denne ansvarsgrensen, men full backendkontroll er ikke gjennomført | Endepunkt- og testkontroll i `su-se-bakover` |
| Alle ruter har en beskrivende dokumenttittel | Tittelverktøy finnes, men brukes ikke på hele rutestrukturen | Rute-for-rute-kontroll og tilgjengelighetstest |
| Person-, skatte- og adresseoppslag har riktig faglig grunnlag og sporing | Frontend verifiserer klientflatene, men ikke backendens kontroll eller audit | Berørte backendendepunkter, tester og faglig kilde |
| `/devTools` og tilhørende `/dev`-endepunkter er utilgjengelige i produksjon | Frontendruten har ingen synlig rolle- eller miljøgate | Backendruting og miljøkonfigurasjon |
| Stack trace i `ErrorBoundary` skal vises i alle miljøer | Dagens komponent viser klientfeilens stack, men ønsket balanse mellom utviklerstøtte og eksponering er ikke dokumentert | Beslutning om miljøavgrensning og feilpresentasjon |
| Eksisterende `console.log`-bruk er en vedtatt frontendstrategi | Enkelte flyter logger lokalt, men det finnes ingen dokumentert browser-loggpolicy | Definer ønsket policy og vurder de berørte flytene |

## Avkreftet

| Påstand | Belegg |
|---|---|
| Wonderwall validerer tokenet på vegne av BFF-en | `server/auth/index.ts` validerer eksplisitt signatur, issuer, audience og utløp |
| Enhver `401` skal starte ny innlogging | Frontend krever `x-login-required`; proxet backend-`401` håndteres som ordinær feil |
| Skjult UI gir autorisasjon | BFF/backend må håndheve tilgang uavhengig av presentasjonen |
| Backendens database- og transaksjonsregler er frontendregler | Frontend har ingen slik persistensgrense |

## Vedlikehold

Flytt en påstand til en temafil først når den er verifisert med riktig
kildestatus. Avkreftede påstander beholdes når de forebygger sannsynlige feil.
