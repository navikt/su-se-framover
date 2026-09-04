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
   for godkjenningen og tidspunkt eller hendelse for ny vurdering.
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
filavgrensede instruksjoner. Importerte skills er underordnet disse reglene og
avgrenses i [`frontend-skills.md`](.github/frontend-skills.md). Domenefiler
beskriver fakta og ansvar, ikke nye koderegler. Uklar eller motstridende
veiledning skal løftes til brukeren.

Ord som `hard rule`, `always`, `never`, «skal» og «aldri» i en importert skill
gir ikke rådet samme status i dette repositoryet. Før en skill brukes, skal
agenten manuelt sammenligne de relevante rådene med gjeldende regler,
repositorykode og teknologistakk. Rapporter mismatch, bruk den repo-riktige
løsningen og fortsett arbeidet. Spør bare når konflikten gjelder en lokal hard
regel, krever et lokalt avvik eller etterlater reell faglig, sikkerhetsmessig
eller arkitektonisk uklarhet.

## Ufravikelige grenser

- Ikke logg tokens, hemmeligheter, fødselsnummer eller andre sensitive
  personopplysninger i nettleser- eller serverlogger.
- Nettleseren skal ikke motta innloggings- eller OBO-token. Wonderwall legger
  brukerens token på kall til BFF-en; BFF-en validerer tokenet og gjør
  OBO-veksling før kall til `su-se-bakover`.
- Skjult eller deaktivert UI er ikke autorisasjon. Backend er autoritativ for
  tilgang, gyldige domenetilstander og tillatte overganger.
- Frontend kan avlede visning fra typed backendstatus, men er ikke autoritativ
  for beregning, tilgang eller gyldige overganger. Presenter backendresultatet
  og håndter at backend kan avvise kallet.
- Runtime-konfigurasjon som sendes til nettleseren skal være eksplisitt
  allowlistet og aldri inneholde serverhemmeligheter.
- Behold supply-chain-vernet i [`.npmrc`](.npmrc): installasjonsskript er slått
  av, pakker må være minst 20 dager gamle, og engine-krav håndheves. Ikke senk
  minimumsalderen eller slå på installasjonsskript uten et eksplisitt, avgrenset
  og forhåndsvurdert unntak.
- Bruk eksakte versjoner uten `^`, `~` eller åpne intervaller i `dependencies`,
  `devDependencies` og `overrides`. Node- og npm-intervallene under `engines` er
  ikke pakkeoppløsning og er unntatt.
- Automatiske npm-oppdateringer skal være patch-only. Minor- og
  majoroppdateringer krever en eksplisitt beslutning og separat vurdering.
- Bruk låsefilen og `npm ci` i automatisering. En manifestendring skal ha
  tilhørende, gjennomgått `package-lock.json`; ikke aksepter uventede
  transitive endringer eller lifecycle-scripts.

## Frontendregler

Normative TypeScript- og React-regler ligger i
[`typescript.instructions.md`](.github/instructions/typescript.instructions.md).
Punktene under er bare et sammendrag. Ved avvik gjelder den filavgrensede
instruksjonen:

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

Normative BFF-regler ligger i
[`bff.instructions.md`](.github/instructions/bff.instructions.md).

## Teknologi og kontroller

Repositoryet bruker React 19, TypeScript 5.9, Vite, Express 5 som BFF, Redux
Toolkit, `@devexperts/remote-data-ts`, `fp-ts`, React Hook Form, Yup, Aksel,
Biome, Jest, npm og Node 24.

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

Copilot cloud agent klargjøres av
[`copilot-setup-steps.yml`](.github/workflows/copilot-setup-steps.yml). Hold
workflowen i samsvar med Node/npm-versjonene, låsefilene og supply-chain-reglene
i repositoryet.

## Kunnskap og historikk

Les [oversikten over AI-styringen](.github/AI-STYRING.md) for filansvar og
vedlikehold. Start i [kunnskapshuben](.github/su-frontend-ekspert.md) ved
oppgaver som krever domene-, flyt-, API-, auth- eller
tilgjengelighetsforståelse. Temafilene er kart inn i gjeldende kode, ikke
erstatning for den.

- [Domenekontekst](.github/domenekontekst/) inneholder verifiserte fakta og
  tydelig merkede grenser.
- [Frontend-skills](.github/frontend-skills.md) beskriver installerte
  arbeidsflyter og repoavgrensninger.
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
