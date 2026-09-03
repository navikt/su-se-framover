# Avklaringer

Denne filen holder uavklarte, historiske og avkreftede påstander unna gjeldende
fakta og regler.

## Uavklart

| Påstand eller spørsmål | Hvorfor uavklart | Krever |
|---|---|---|
| Alle frontendtyper samsvarer med gjeldende DTO-er i `su-se-bakover` | Frontendtypene og klientene er verifisert lokalt, men full DTO-sammenligning er ikke gjennomført | Kontrakt-for-kontrakt-kontroll i begge repoer |
| `io-ts` skal være generell kontraktstrategi | Pakkene er installert, men brukes ikke i `src/**` | Egen beslutning og migreringsplan; inntil da brukes målrettede guards/decodere |
| Alle reguleringer ender i én av et fast sett forretningsutfall | Frontend har flere statuser, men faglig uttømmende betydning eies av backend | Gjeldende backendkode og faglig kilde |
| Regulering, stans og gjenopptak sender aldri vedtaksbrev | Frontend viser egne brevvalg i deler av revurderingsflyten, men beviser ikke en generell regel | Kontroll av hver backendflyt |
| Oversendt utbetaling er ferdig utbetalt | Frontend viser deler av kjeden, men eier ikke ekstern kvittering | Backendkontrakt og statuskilde |
| Gjenopptak er alltid faglig tillatt etter stans | Frontend bruker `utbetalingerKanStansesEllerGjenopptas` som presentasjonsgrunnlag | Backendens gyldighetsregel og tilgangskontroll |
| React 19 `ref` som prop skal erstatte all `forwardRef` | Begge mønstre finnes i kodebasen | Egen teknisk beslutning |
| Importstil for `fp-ts` skal standardiseres | Både `fp-ts/X`, `fp-ts/lib/X` og en lokal facade brukes | Egen oppryddingsbeslutning |
| Component testing skal være obligatorisk | Jest-oppsettet har ikke etablert DOM-/komponenttestmiljø | Beslutning om testverktøy og supply-chain-vurdering |

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
