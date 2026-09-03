# Eksterne repoer og systemgrenser

## `navikt/su-se-bakover`

Backend er autoritativ for:

- domenetilstand og gyldige overganger
- tilgang til person, sak og operasjon
- beregning og simulering
- vedtak, brevoperasjoner og integrasjoner
- persistens og sideeffekter

Frontend presenterer status og tilbyr handlinger gjennom API-et. Når en
frontendtype eller faglig tekst avhenger av backend, skal påstanden kontrolleres
mot gjeldende endepunkt eller DTO i begge repoer.

`navikt/su-se-bakover#2967` er et strukturelt forbilde for AI-styringen og et
kart over domenet. Backendens Kotlin-, Flyway-, SQL-, Kotliquery-, session-,
transaksjons- og persistensregler gjelder ikke automatisk her.

## Andre grenser

Frontendens dokument- og utbetalingsvisninger kan gjenspeile statuser fra
nedstrøms systemer, men går gjennom `su-se-bakover`. Denne kodebasen er derfor
ikke alene en autoritativ kilde til hva en ekstern kvittering eller
distribusjonsstatus betyr.

Lokalt brukes Wonderwall og en mock OIDC-provider for å etablere samme
grunnleggende authgrense som i miljø. Dette er utviklingsinfrastruktur, ikke en
alternativ produksjonsflyt.

## Kilderegel

Bruk eksterne dokumenter og repoer til å danne hypoteser. Merk påstanden
`cross-repo` først når begge sider av grensen er kontrollert. Legg resten i
[avklaringer](avklaringer.md).
