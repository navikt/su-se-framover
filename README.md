# su-se-framover

Frontend for Su-Se som slår opp informasjon om brukere som har søkt om supplerende stønad.

## Kjøre lokalt

Første gang:

```sh
$ cp .env.template .env # for å sette opp lokale miljøvariabler
$ npm install # installerer avhengigheter
```

Starte for lokal utvikling:

```sh
$ docker compose up # starter Redis og mock-oauth2-server (se under for mer info)
$ npm start
```

`docker compose up` kjører opp Redis og [#mock-oauth2-server](#mock-oauth2-server).

`npm start` starter opp `express`-serveren med `parcel`-middleware som ordner med bygging av frontenden.

## Redis

Brukes for å cache bruker-sessions.
Lokalt oppsett ligger i [./docker-compose.yml](), mens nais-oppsettet ligger i [./nais.yml]().

### Koble til

Vi har erfart at det er lettere å bruke et GUI-verktøy når det kommer til Redis.

-   Linux: https://docs.redisdesktop.com/en/latest/install/
-   Mac: brew install --cask redisinsight

#### Lokalt

-   Antar at du har kjørt `docker compose up` og at docker-containeren kjører lokalt.
-   Start opp RedisInsight. Koble til med hostname: `localhost` eller `127.0.0.1`. port: `6379`, username: `default` og passord: `subar` (ligger i docker-compose.yml)

#### Via naisdevice i preprod

-   kubectx dev-fss
-   kubectl --namespace=supstonad get pods # kopier ut redis pod-navnet
-   kubectl --namespace=supstonad port-forward <pod> 6379:6379 # din_port:nais_port
-   Kobler til med hostname: localhost, port: <din_port>, default username og passord finner du ved å kjøre `env` inne i podden.

## Mock oauth2 server

For autentisering lokalt så bruker vi https://github.com/navikt/mock-oauth2-server.

Vi bruker Docker for å kjøre den, konfigurert i [./docker-copmpose.yml]().

## Azure

Dersom man har behov for å gå direkte mot Azure kan man legge inn inn verdiene fra `.env.azure.template` (og hente resterende verdier fra Kubernetes).
Merk at `AZURE_APP_CLIENT_JWKS` roteres for hver deploy/restart.
En må legge inn `AZURE_APP_WELL_KNOWN_URL` i `su-se-bakover` sin .env fil.

Dersom en får `The reply URL specified in the request does not match the reply URLs configured for the application` bør man dobbeltsjekke i Azure Portal at localhost er registrert som en gyldig reply URL.

## Bygge prod-versjon

### Frontend

```sh
$ npm run build
```

Output havner da i `./dist`-mappen.

### Backend

```sh
$ cd server
$ npm run build
```

Output havner da i `./server/dist`-mappen.

#### Teknisk

Frontend bygges hvor som helst, da output derfra bare er statiske filer (`.html`, `.css`, `.js` osv).
For backend sin del så er den f.eks. avhengig av `node_modules`, så det er greit om den bygges (og avhengigheter installeres) der den skal kjøre.
Dette gjøres nå i [./Dockerfile]().

## Miljøvariabler

Vi er avhengige av noen variabler som varierer med miljø; for eksempel URL til su-se-bakover.
Disse styres gjennom `.env` lokalt og på vanlig måte i miljøene.

### Legge til ny variabel

1. Legg den til i [./.env]() (og [./.env.template]()), [./nais-dev.json]() og [./nais-prod.json]()
    - **Merk**: Hvis verdien er hemmelig så må man heller legge den inn i `Vault` enn i `nais.json`-filene
2. Legg den til i [./server/config.ts](); enten i `server`- eller `client`-verdien, avhengig av hvor den skal brukes

### Miljøvariabler for frontend (teknisk)

Det er satt opp slik at denne konfigurasjonen settes i en `script`-tag av typen `application/json`, som så lastes inn og parses runtime (i frontend).

Under lokalutvikling gjøres dette av `posthtml` (med `posthtml-expressions`) som en del av Parcel-bygget.
Ute i miljøene gjøres det gjennom bruk av `handlebars`.
Vi utnytter at både `posthtml-expressions` og `handlebars` har samme syntax for å sette inn "unescaped" verdier (`{{{verdi}}}`).

Se [./src/index.html](), [./posthtml.config.js](), [./server/config.ts]() og [./server/routes.ts]() for mer info.
