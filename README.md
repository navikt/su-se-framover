# su-se-framover

Frontend for Su-Se som slår opp informasjon om brukere som har søkt om supplerende stønad.

## Kjøre lokalt

Første gang: kjør `npm install` for å laste ned avhengighetene

`npm run start` for å starte appen

## Bygge prod-versjon

`npm run build` for å kompilere

## Miljøvariabler

Vi er avhengige av noen variabler som varierer med miljø; for eksempel URL til su-se-bakover.
Siden frontend bare bygges én gang og deployes til forskjellige miljøer kan vi ikke bruke `process.env` direkte (da de bare er compile-time).

Vi bruker en kombinasjon av https://www.npmjs.com/package/posthtml-expressions og `envsubst` i [./docker-entrypoint.sh]() for å få til dette.

### Legge til ny variabel

1. Legg den til på `window` i [./src/index.html]()
1. Legg den til i `variables` i [./posthtml.config.js]()
    - Verdien på denne er default-verdien som brukes lokalt
1. Legg til den faktiske verdien i [./nais-dev.json]() og [./nais-prod.json]()
    - **Merk**: Hvis verdien er hemmelig så må man heller legge den inn i `Vault` enn i `nais.json`-filene

Merk: variabelnavnet må være identisk med navnet på miljøvariabelen

#### Eksempel:

```js
// src/index.html
window.MIN_VARIABEL = '{{MIN_VARIABEL}}';

// posthtml.config.js
const variables = {
    // ...
    MIN_VARIABEL: 'fin verdi som brukes lokalt'
};

// nais-dev.json
{
  // ...
  "env": {
    // ...
    "MIN_VARIABEL": "denne brukes i test"
  }
}

// nais-prod.json
{
  // ...
  "env": {
    // ...
    "MIN_VARIABEL": "denne brukes i prod"
  }
}
```

Man kan nå fint bruke `window.MIN_VARIABEL` i frontendkoden.
