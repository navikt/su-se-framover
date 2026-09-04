# su-se-framover

Frontend for Su-Se som slår opp informasjon om brukere som har søkt om supplerende stønad.

## Kjøre lokalt

Første gang:

Kjør `get_started.sh`

```sh
$ cp .env.template .env # for å sette opp lokale miljøvariabler
$ npm install # installerer avhengigheter for frontend
$ npm install --prefix server # installerer avhengigheter for server (BFF)
$ npm run prepare # installerer Husky git hooks (pre-commit, pre-push)
# eventuelt: npm run install:all (kjører alle tre over)
```

### Hvorfor `npm run prepare` som eget steg?

`.npmrc` har `ignore-scripts=true` for å beskytte mot ondsinnede lifecycle-skript i tredjeparts pakker (supply chain-angrep).
Dette skrur også av våre egne lifecycle-skript, inkludert `prepare` som installerer Husky git hooks.
Derfor må `npm run prepare` kjøres eksplisitt etter install (det er ikke et lifecycle-skript når det kalles direkte, så `ignore-scripts` påvirker det ikke).

Trenger du å kjøre install-skript for en spesifikk pakke (f.eks. native bindings),
skal behovet og pakken vurderes eksplisitt først. Overstyr bare for den avgrensede
installasjonen, og ikke endre den innskrevne `.npmrc`-regelen:
```sh
$ npm install --ignore-scripts=false
```

# Moduler release age
NPM er låst til at pakker må ha en release tid på 20 dager. -> min-release-age=20
Dette er låst i .npmrc lokalt og i `npm ci --min-release-age 20` for pakker i ci builds.
Hvis dette skjer får man en slik feilmelding:
```sh
    npm error code ETARGET
    npm error notarget No matching version found for vite-tsconfig-paths@6.0.5 with a date before 1/23/2026, 1:30:50 PM.
    npm error notarget In most cases you or one of your dependencies are requesting
    npm error notarget a package version that doesn't exist.
```

Verifisere min-release-age kan gjøres ved å kjøre `npm config get before` -> en dato for --min-release-age dager siden.
Ved avgrenset feilsøking kan verdien overstyres lokalt etter en eksplisitt
vurdering. Vanlige installasjoner og avhengighetsoppdateringer skal ikke redusere
20-dagersgrensen.

Starte for lokal utvikling:
```sh
$ docker compose up # starter mock-oauth2-server og Wonderwall (se under)
$ npm start
```

`docker compose up` kjører opp [mock-oauth2-server](#mock-oauth2-server) og [Wonderwall](#innlogging-wonderwall) (login-proxy).

`npm start` starter opp `express`-serveren (BFF, port 5678) som igjen starter `vite` (frontend, port 1234).

**Åpne appen på http://localhost:3000** (gjennom Wonderwall) — ikke `:1234` direkte. Wonderwall auto-logger deg inn mot mock-oauth2-server og proxer videre til Vite. `:1234` er kun frontend uten innlogging.

I tillegg må `su-se-bakover` kjøres lokalt (validerer tokenene mot den samme mock-oauth2-server på `http://localhost:4321/default`).

### Oppgradering fra gammel versjon (før Wonderwall)

Auth er migrert fra en egen OIDC-stack (`passport`/`openid-client`/`express-session`/`redis`) til
[Wonderwall](#innlogging-wonderwall) (login-proxy) + manuell token­validering med `jose`. Var du på
den gamle versjonen må du:

1. **Reinstaller server-avhengigheter** (gammel stack fjernet, `jose` lagt til):
   ```sh
   npm run install:all   # eller: npm ci --prefix server
   ```
2. **`.env` trengs normalt ikke lokalt.** BFF-en har dev-defaults for alle auth-variablene
   (peker på docker-compose-stacken, se [server/config.ts]()), og Wonderwall har en innebygd
   dev-`WONDERWALL_ENCRYPTION_KEY` i `docker-compose.yml`. Har du en gammel `.env` fra før, kan
   du fjerne utdaterte session-/redis-variabler; sett kun variabler hvis du trenger å overstyre
   en default.
3. **Hent nytt docker-image og start Wonderwall** (ny tjeneste i `docker compose`):
   ```sh
   docker compose pull && docker compose up
   ```
4. **Bruk http://localhost:3000** (gjennom Wonderwall) — ikke `:1234` direkte.
5. **Slett gamle cookies** for `localhost` (en gammel sesjon fra før merge kan forstyrre).

### Feilsøking lokalt

- **`authenticateUser: Mangler bearer-token fra Wonderwall` / appen looper på `:1234`:**
  Du har åpnet appen på `http://localhost:1234` (Vite direkte) i stedet for `http://localhost:3000`.
  Da omgås Wonderwall, og `Authorization: Bearer`-headeren blir aldri lagt på. BFF-en svarer `401`,
  frontend redirecter til `/oauth2/login` — men på `:1234` finnes ikke det endepunktet (kun i
  Wonderwall på `:3000`), så SPA-fallbacken serverer appen på nytt og det looper. Dette er ikke en
  feil, bare feil URL: **åpne `http://localhost:3000`**. På `:3000` (og i dev/prod) etablerer
  Wonderwall en sesjon, og loopen oppstår ikke.
- **`Bad Gateway` / Wonderwall-logg: `dial tcp 192.168.5.2:1234: connect: connection refused`:**
  Skjer når Vite ender opp med å lytte kun på IPv6-loopback (`::1`), mens Wonderwall når Vite via
  en IPv4-tilkobling. Vite sin default (`host: 'localhost'`) er ikke deterministisk: Node kan resolve
  `localhost` til enten IPv4 (`127.0.0.1`) eller IPv6 (`::1`) avhengig av Node-versjon og oppsett, og
  på moderne Node/macOS havner den ofte på `::1`. `::1` og `127.0.0.1` er to helt separate
  adresser/sockets: en tjener som kun lytter på `::1` kan ikke svare på en IPv4-tilkobling til
  `127.0.0.1`. Wonderwall kjører inne i Docker/Colima-VM-en og når host-Vite via
  `host.docker.internal`, som Colima videresender til host-ens **IPv4**-loopback. Treffer den en
  IPv6-only Vite, svarer OS-et med RST → `connection refused` → `Bad Gateway`.

  ```
  Nettleser
     │  http://localhost:3000
     ▼
  Wonderwall  (i Colima-VM, lytter :3000)
     │  proxy til host.docker.internal:1234
     ▼
  Colima-broen  ──►  sender en IPv4-tilkobling mot host 127.0.0.1:1234
     │
     ▼
  host 127.0.0.1:1234 (IPv4)  ──►  ingen lytter her  →  RST → "connection refused"

  Vite lytter på  ::1:1234 (IPv6)  ──►  men IPv4-tilkoblingen kommer aldri hit
  ```

  Fikset er `host: '127.0.0.1'` i `vite.config.ts`: da binder Vite deterministisk IPv4-loopback,
  uavhengig av Node-/OS-versjon, og uten å eksponere dev-serveren på nettverket. Sjekk med
  `lsof -i :1234` — det skal stå `127.0.0.1:1234 (LISTEN)`, ikke `[::1]:1234` eller `*:1234`.
- **Fortsatt token-problemer?** Sjekk at `docker compose up` faktisk har `mock-oauth2-server` og
  `wonderwall` oppe, at BFF-en lytter på `:5678` og Vite på `:1234`, og slett gamle `localhost`-cookies.

## Innlogging (Wonderwall)

Autentisering skjer med [Wonderwall](https://doc.nais.io/auth/explanations/#login-proxy) (login-proxy), i tråd med NAIS `azure.sidecar`.

- I dev/prod kjører Wonderwall som en sidecar (konfigurert via `azure.sidecar` i [.nais/{dev,prod}-gcp.yaml]()). NAIS auto-provisjonerer klienten — **ingen egne secrets kreves**.
- Wonderwall håndterer `/oauth2/login`, `/oauth2/logout` og session, og legger brukerens `access_token` på `Authorization`-headeren mot appen. Wonderwall **validerer ikke** tokenet — det er appens ansvar.
- Vi bruker `azure.sidecar.autoLogin: true`, så uinnloggede GET-navigasjoner sendes automatisk til `/oauth2/login` før appen lastes. For ikke-GET-forespørsler (og XHR) uten gyldig session svarer BFF-en `401`, og frontend redirecter da selv til `/oauth2/login` (se [src/api/apiClient.ts]()). Ved utlogging går brukeren til `/oauth2/logout` (global logout hos Entra) og sendes tilbake til innlogging. Økten fornyes server-side med refresh tokens (Azure) og varer inntil 10 timer fra første innlogging.
- BFF-en validerer tokenets signatur, issuer, audience og utløp med [`jose`](https://github.com/panva/jose) (`jwtVerify` mot Azure JWKS), og veksler det så til et OBO-token for `su-se-bakover` ved å kalle Azure sitt token-endpoint direkte (grant `jwt-bearer`), se [server/auth/index.ts]() og [server/auth/obo.ts]().

Lokalt kjøres Wonderwall i docker-compose og OBO-vekslingen går mot mock-oauth2-server, slik at app-koden er identisk i alle miljøer (ingen egne kodegrener for lokal utvikling).

## Mock oauth2 server

For autentisering lokalt bruker vi [mock-oauth2-server](https://github.com/navikt/mock-oauth2-server), startet via [./docker-compose.yml]().
Konfigurasjonen ligger i [./.docker/mock-oauth2-config.json]() og legger på `aud`, `NAVident` og `groups`
(både på innloggingstokenet og OBO-tokenet) slik at `su-se-framover` og `su-se-bakover` får de claims-ene de trenger.

Issuer er `http://localhost:4321/default`. `su-se-bakover` må peke sin `AZURE_APP_WELL_KNOWN_URL` mot den samme serveren.

### Nødvendige `.env`-variabler (auth)

`.env.template` inneholder verdiene under. De settes automatisk av NAIS i dev/prod; lokalt peker de på docker-compose-stacken:

```sh
AZURE_APP_CLIENT_ID=supstonad
AZURE_APP_CLIENT_SECRET=supstonad-secret
AZURE_OPENID_CONFIG_ISSUER=http://localhost:4321/default
AZURE_OPENID_CONFIG_JWKS_URI=http://localhost:4321/default/jwks
AZURE_OPENID_CONFIG_TOKEN_ENDPOINT=http://localhost:4321/default/token
SU_SE_BAKOVER_AAD_APP_NAME=su-se-bakover
```

I tillegg trenger Wonderwall (docker-compose) en krypteringsnøkkel for session-cookies. Den er
**ikke** sjekket inn – sett den i `.env` (Docker Compose leser `.env` automatisk). Generer én med
`openssl rand -base64 32`:

```sh
WONDERWALL_ENCRYPTION_KEY=<output fra openssl rand -base64 32>
```

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

1. Legg den til i [./.env]() (og [./.env.template]()), [./.nais/dev-gcp.yaml]() og [./.nais/prod-gcp.yaml]()
    - **Merk**: Hvis verdien er hemmelig så må man heller legge den inn i `Vault` enn i `nais`-filene
2. Legg den til i [./server/config.ts](); enten i `server`- eller `client`-verdien, avhengig av hvor den skal brukes

### Hemmelige variabler

https://doc.nais.io/security/secrets/kubernetes-secrets/

### Miljøvariabler for frontend (teknisk)

Det er satt opp slik at denne konfigurasjonen settes i en `script`-tag av typen `application/json`, som så lastes inn og parses runtime (i frontend).

Under lokalutvikling gjøres dette av `posthtml` (med `posthtml-expressions`) som en del av Vite-bygget.
Ute i miljøene gjøres det gjennom bruk av `handlebars`.
Vi utnytter at både `posthtml-expressions` og `handlebars` har samme syntax for å sette inn "unescaped" verdier (`{{{verdi}}}`).

Se [./src/index.html](), [./posthtml.config.js](), [./server/config.ts]() og [./server/routes.ts]() for mer info.

## Node og npm oppgradering

- Må oppgradere .github/workflows (`build-push-deploy-to-dev.yml`) sin `node-version:`
- I `package.json` og `server/package.json`: Endre `engines->node`
- I `Dockerfile` endre `FROM .*:`
- Lokalt, dersom du bruker nvm, `nvm install <version>; nvm use <version>; nvm alias default <version>;` Må muligens også oppdatere paths.
