# Agentinstruksjoner for su-se-framover

Dette er det kanoniske, verktøyuavhengige regelsettet for AI-agenter som arbeider i
repositoryet. Leverandørspesifikke filer skal være minimale innganger til dette
regelsettet, ikke kopier.

## Arbeidsmåte

1. Forstå målet. Spør når mål, faglig premiss, regelstatus eller scope er reelt
   uklart.
2. Les tilgjengelige repositoryfiler selv. Ikke be brukeren kjøre `cat`, `nl`,
   søkekommandoer eller lime inn filer agenten allerede kan lese.
3. Spor den berørte flyten fra rute og UI via state og API-klient til BFF- og
   backendgrensen.
4. Finn tilsvarende kode og tester før du lager en ny variant.
5. Skill verifiserte fakta fra hypoteser. Kode og tester dokumenterer faktisk
   oppførsel; faglige og juridiske påstander krever en gyldig fagkilde.
6. Gjør presise, komplette endringer og kjør den minste relevante kontrollen.
7. Bruk parallelle agenter bare for uavhengige undersøkelser. Ellers eier den
   startede agenten oppgaven til den er ferdig eller har feilet.
8. Bruk en høykapasitets sparringsagent ved komplekse domene-, auth-, arkitektur-
   eller kildekritiske vurderinger.
9. Del store regelgjennomganger i korte beslutningsgrupper.

Eksisterende praksis er et sterkt utgangspunkt, ikke en erstatning for vurdering.
Alternative metodikker skal vurderes når de oppnår målet tryggere eller enklere.
Ikke fjern eller svekk eksisterende veiledning uten å forklare konflikten og få
eksplisitt enighet.

## Regelkontroll før og etter endringer

Før en AI-agent endrer kode eller dokumentasjon:

1. Finn alle regler som gjelder for berørte filer og flyter.
2. Sammenlign planlagt løsning med reglene og dokumenterte domenefakta.
3. Rapporter relevant mismatch før endringen.
4. Beskriv regelen, konsekvensen og et regelkonformt alternativ.
5. Vent på eksplisitt godkjenning før et avvik brukes.
6. Registrer et godkjent avvik med scope, begrunnelse, konsekvenser, status, belegg
   og tidspunkt eller hendelse for ny vurdering.
7. Kontroller det ferdige resultatet mot både reglene og det godkjente avviket.

Godkjente avvik registreres i
[`avvik.jsonl`](.github/ai-historikk/avvik.jsonl). Et avvik gjelder bare oppgitt
scope, er ikke presedens og blir ikke automatisk en ny standard. Lov-, personvern-
og sikkerhetskrav kan ikke overstyres gjennom avviksloggen.

## Regeltyper og kildehierarki

- **Hard regel** - håndheves av verktøy, kode, test, ekstern kontrakt eller
  ufravikelige sikkerhets-, personvern- og lovkrav.
- **Teamregel** - avtalt standard for ny eller endret kode.
- **Anbefaling** - ønsket praksis som kan fravikes med en begrunnelse.
- **Gjeldende strategi** - faktisk retning i dagens kode, uten at den nødvendigvis
  er vedtatt som regel.
- **Uavklart påstand** - mangler tilstrekkelig belegg og skal ikke implementeres
  som gjeldende regel.

Ved konflikt gjelder ufravikelige krav først, deretter dette regelsettet og
filavgrensede instruksjoner. Domenefiler beskriver fakta og ansvar, ikke nye
koderegler. Uklar eller motstridende veiledning skal løftes til brukeren.

## Ufravikelige grenser

- Ikke logg tokens, hemmeligheter, fødselsnummer eller andre sensitive
  personopplysninger i nettleser- eller serverlogger.
- Nettleseren skal ikke motta innloggings- eller OBO-token. Wonderwall legger
  brukerens token på kall til BFF-en; BFF-en validerer tokenet og gjør
  OBO-veksling før kall til `su-se-bakover`.
- Skjult eller deaktivert UI er ikke autorisasjon. Backend er autoritativ for
  tilgang, gyldige domenetilstander og tillatte overganger.
- Ikke dupliser backendens beregnings-, tilgangs- eller overgangsregler i
  frontend. Presenter backendresultatet og håndter at backend kan avvise kallet.
- Runtime-konfigurasjon som sendes til nettleseren skal være eksplisitt
  allowlistet og aldri inneholde serverhemmeligheter.
- Behold supply-chain-vernet i [`.npmrc`](.npmrc): installasjonsskript er slått av,
  pakker må ha minimumsalder, og engine-krav håndheves. Et nødvendig unntak skal
  være eksplisitt, avgrenset og vurdert før installasjon.

## Frontendregler

Filavgrensede TypeScript- og React-regler ligger i
[`typescript.instructions.md`](.github/instructions/typescript.instructions.md).
Viktige teamregler er:

- Bruk målrettet runtime-validering ved utsatte datagrenser.
- Modeller relevante asynkrone tilstander eksplisitt med `RemoteData`.
- Vis en forståelig tomtilstand når fravær ellers kan forveksles med lasting eller
  feil.
- Bruk ikke-null-assertion (`!`) bare når en runtime-sjekk har etablert invarianten.
- Bruk React Hook Form og repositoryets Yup-oppsett for flerfelts- og
  domeneskjemaer.
- Hold state lokalt som standard; bruk Redux for delt eller tverrgående state.
- Bruk Aksel-komponenter og tokens før egenimplementerte varianter. Bevar semantisk
  HTML, tastaturstøtte, fokusrekkefølge, skjermleserinformasjon og forståelig
  feiltekst.

## Teknologi og kontroller

Repositoryet bruker React 19, TypeScript 5.9, Vite, Express 5 som BFF, Redux
Toolkit, `remote-data-ts`, `fp-ts`, React Hook Form, Yup, Aksel, Biome, Jest, npm
og Node 24.

Bruk eksisterende npm-skript og den minste kombinasjonen som dekker endringen:

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run build:server
```

`npm run lint-and-typecheck` bruker en skrivende Biome-kommando. Bruk den ikke som
en ren kontroll dersom arbeidsområdet ikke skal endres.

## Kunnskap og historikk

Start i [kunnskapshuben](.github/su-frontend-ekspert.md) ved oppgaver som krever
domene-, flyt-, API-, auth- eller tilgjengelighetsforståelse. Temafilene er kart
inn i gjeldende kode, ikke erstatning for den.

- [Domenekontekst](.github/domenekontekst/) inneholder verifiserte fakta og
  tydelig merkede grenser.
- [Avklaringer](.github/domenekontekst/avklaringer.md) inneholder uavklarte,
  historiske og avkreftede påstander.
- [Prosesslæring](.github/agents/su-frontend-ekspert.lessons.jsonl) inneholder bare
  varig læring om agentens arbeidsmåte, aldri domenefakta.
- [Godkjente avvik](.github/ai-historikk/avvik.jsonl) inneholder avgrensede unntak.
- [Endringshistorikk](.github/ai-historikk/endringer.jsonl) gjelder bare
  AI-regler, agentprofiler og domenedokumentasjon. Git er historikken for
  ordinære kodeendringer.

Backendens Kotlin-, Flyway-, SQL-, Kotliquery-, database-session-, transaksjons-
og persistensregler er ikke frontendregler og skal ikke kopieres hit.
