# Frontend-skills

Dette registeret beskriver repoets installerte frontend-skills og hvordan de skal
brukes sammen med de kanoniske reglene.

Skillene er hentet fra
`navikt/copilot@24ad9baf95ae381f03a1a1bad69199b5d4532aa6` og ligger som
versjonerte mapper under `.github/skills/`. Copilot CLI (`cplt`) finner dem
direkte i repositoryet. Oppsettet bruker ikke Nav Pilot. Kilde og innholdshasher
ligger i [`skills.lock.json`](skills.lock.json).

`sha256-directory-v1` er SHA-256 av én linje per fil på formen
`<filens SHA-256><to mellomrom><relativ filsti><linjeskift>`, sortert på relativ
filsti. Hashen dekker alle vanlige filer i skillmappen.

## Prioritet og avgrensning

1. [`../AGENTS.md`](../AGENTS.md) og filavgrensede instruksjoner er normative.
2. Denne filen avgrenser hvordan de importerte skillene brukes i repoet.
3. En skill gir arbeidsflyt og faglig støtte, men kan ikke overstyre
   repositoryregler, sikkerhetskrav, avtalte teknologivalg eller domenefakta.
4. Bruk bare skillen som matcher oppgaven. Ikke last alle skillene for enhver
   frontendendring.
5. Eksempler i en skill er ikke automatisk riktige for dette repoet. Tilpass dem
   til npm, Vite, React 19, Aksel-versjonen i `package.json` og den etablerte
   BFF-grensen.
6. En regelmerking i upstream-skillen får ikke lokal regelstatus. Sammenlign
   relevante råd manuelt med `AGENTS.md`, filinstruksjonene og berørt kode før
   rådet brukes.
7. Rapporter en mismatch og bruk den lokale regelen eller etablerte løsningen.
   Fortsett oppgaven uten å be om et avvik fra en skill. Spør bare hvis den
   repo-riktige løsningen fortsatt er reelt uklar eller krever avvik fra en lokal
   regel.

Ikke rediger en importert skill for å skjule en konflikt. Behold upstream-filen
sporbar, og dokumenter repoets overstyring i dette registeret.
En verifisert feil i selve skillteksten kan rettes lokalt når rettelsen
registreres i `localPatches` i [`skills.lock.json`](skills.lock.json) og
innholdshashen oppdateres.

## Installerte skills

| Skill | Manuelt kontrollert mismatch | Lokal bruk |
|---|---|---|
| [`aksel-builder`](skills/aksel-builder/SKILL.md) | Skillen er laget for Aksel v8+ og gjør MCP-oppslag til en hard regel. Repoet bruker Aksel 7.33.0. Flere referanser gjelder v8-tokens, Tailwind, Next.js og theming som ikke er etablert her. | Installerte pakker, TypeScript-typer og eksisterende kode er fasit for tilgjengelig v7-API. Bruk versjonstilpasset Aksel-dokumentasjon ved reell API-usikkerhet, ikke som obligatorisk oppslag for kjent lokal bruk. Ikke bruk v8-eksempler eller start majoroppgradering uten egen beslutning. |
| [`web-design-reviewer`](skills/web-design-reviewer/SKILL.md) | Skillen tilbyr generiske råd for Tailwind, Next.js, CSS Modules og CSS-in-JS og krever ett-og-ett fiksesteg. Det beskriver ikke automatisk dette Vite-repoet eller repositoryets regel om samlede, logiske endringer. | Detekter faktisk styling og komponentmønster fra koden. Bruk Aksel og etablert CSS. Test gjennom den lokale Wonderwall-flyten med testdata, og ikke ta eller lagre skjermbilder med reelle personopplysninger, tokens eller andre sensitive data. |
| [`klarsprak`](skills/klarsprak/SKILL.md) | Skillen formulerer stilvalg som absolutte regler, blant annet ordvalg, tankestrek og når brukeren skal spørres. Dette er språkråd, ikke lokale harde regler. | Bevar faglig og juridisk betydning, etablerte domenebegreper, kodeverdier og dokumentets eksisterende målform og stil. Rapporter språklige avvik, men ikke gjennomfør bred språkvask eller omstrukturering uten at det inngår i oppgaven. |
| [`security-owasp`](skills/security-owasp/SKILL.md) | Skillen dekker Kotlin, Go, Java, SQL og database, og merker blant annet SHA-pinning av Actions og tilgangskontroll på alle endepunkter som absolutte regler. Dette er ikke vedtatte frontendregler og kan plassere backendansvar i BFF-en. | Bruk bare relevante browser-, TypeScript-, Node/BFF-, auth-, input-, logging-, feil- og supply-chain-råd. Autorisasjon og domeneoverganger forblir backendansvar. Ikke innfør database-/backendregler eller gjør bred Actions-omlegging uten separat beslutning. |

## Bevisst ikke inkludert

- TokenX- og generiske auth-skills: repoet bruker Wonderwall, `jose` og
  eksisterende Azure OBO-kode i `server/auth/`.
- Playwright: verken testverktøyet eller komponenttestinfrastruktur er etablert.
- Generiske API-skills: frontendens kontrakt og BFF-mønster er dokumentert
  lokalt og skal følge det konkrete backendendepunktet.
- Observability-, troubleshooting- og Grafana-skills: repoet har Pino-basert
  BFF-logging, men ingen verifisert tracing-, browser-telemetri- eller
  querybibliotek-stack.
- Generiske planleggings- og intervju-skills: planlegging og avklaringer inngår i
  hovedagentens faste arbeidsmåte.

## Avhengigheter og verktøy

En skill gir ikke i seg selv godkjenning til å:

- legge til eller oppgradere en npm-pakke
- slå på installasjonsskript
- redusere 20-dagersgrensen
- introdusere minor- eller majoroppdateringer
- starte eksterne tjenester eller omgå auth

Slike endringer følger alltid `AGENTS.md`, `.npmrc` og eksplisitte
regelbeslutninger.

## Oppdatering

Hent valgte mapper direkte fra `navikt/copilot` ved en eksplisitt commit. Bruk
ikke Nav Pilot. Før en oppdatering:

1. Sammenlign hver endret upstream-fil med forrige versjon.
2. Gjenta den manuelle kontrollen mot lokale regler og faktisk teknologistakk.
3. Oppdater dette registeret dersom en mismatch er ny, endret eller fjernet.
4. Oppdater full commit-SHA og lokale innholdshasher i
   [`skills.lock.json`](skills.lock.json).
5. Valider at Copilot CLI fortsatt finner skillens `SKILL.md`.

En upstream-endring kan ikke automatisk endre repoets regler.
