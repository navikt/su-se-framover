# SU-frontend-ekspertens kunnskapshub

Dette er inngangen til verifisert kunnskap om `su-se-framover`. Dokumentasjonen er
et kart inn i gjeldende kode, ikke en erstatning for kode, tester eller faglige
kilder.

## Slik brukes kunnskapsbasen

1. Les [`../AGENTS.md`](../AGENTS.md) og relevante filinstruksjoner.
2. Les bare temafilene som berører oppgaven.
3. Kontroller kritiske påstander mot gjeldende kode og tester.
4. Verifiser kryss-repo-påstander mot både frontend og gjeldende backendkontrakt.
5. Flytt uavklarte, historiske eller avkreftede påstander til
   [avklaringsfilen](domenekontekst/avklaringer.md).
6. Oppdater riktig temafil når ny, varig kunnskap er bekreftet.

Hovedagenten bruker dette frontend- og brukerreiseperspektivet som standard.
Brukeren trenger ikke velge `su-frontend-ekspert` manuelt. En støtteagent kan
undersøke et avgrenset spørsmål, men hovedagenten beholder oppgaveeierskapet og
kontrollerer rådet mot repositoryet.

## Velg kunnskap etter oppgaven

| Oppgave | Last ved behov |
|---|---|
| Ny side, komponent eller skjema | TypeScript-instruksjonen, Aksel- og tilgjengelighetskonteksten og `aksel-builder`. Kontroller skjema-, feil- og fokusmønster i eksisterende kode. |
| Endret brukerreise | Brukerflyter, berørte domenefiler, UI-tilstand og eventuelt `klarsprak`. |
| Kall mot backend | API og kontrakter, berørt frontendtype, BFF-grensen og det konkrete backendendepunktet eller DTO-en. |
| Innlogging, token eller tilgang | Autentisering og tilgang, BFF-instruksjonen og relevant sikkerhetsstøtte. Gjeldende løsning er Wonderwall, `jose` og egen OBO-flyt, ikke Oasis. |
| Visuell feil | `aksel-builder`, `web-design-reviewer`, eksisterende CSS og tilgjengelighetskonteksten. |
| Tilgjengelighet | Aksel og tilgjengelighet, semantikken i berørt komponent og eventuelt `accessibility-agent`. |
| Produksjonsfeil | Systemoversikt, observerbarhet, UI-tilstand og feilhåndtering, BFF-logger og den konkrete flyten. |
| Norsk brukerinnhold | Berørt domenefil, eksisterende mikrotekst, `klarsprak` og eventuelt `forfatter`. |
| E2E-test | Avklar først teststrategi og avhengigheter. Playwright er ikke installert eller en del av de låste skillene. |

Aksel og tilgjengelighet skal vurderes sammen ved ny eller endret interaksjon.
En ren spacing-endring trenger normalt ikke domenefiler. Last domenekunnskap når
handlingen kan påvirke behandling, attestering, beregning, vedtak, brev,
utbetaling, stans, opphør, regulering eller tilgang til person og sak.

## Kildestatus

| Status | Betydning |
|---|---|
| `verified` | Bekreftet i gjeldende frontendkode, test eller konfigurasjon |
| `cross-repo` | Bekreftet på begge sider av en repositorygrense |
| `current-strategy` | Beskriver dagens løsning, men er ikke en vedtatt regel |
| `historical` | Beskriver eldre oppførsel |
| `unresolved` | Mangler tilstrekkelig belegg |
| `rejected` | Avkreftet av nyere, sterkere belegg |

## Temaer

| Tema | Bruk når du skal forstå |
|---|---|
| [Systemoversikt](domenekontekst/systemoversikt.md) | frontend, BFF, backend og tekniske grenser |
| [Brukerflyter](domenekontekst/brukerflyter.md) | ruter, sider og hovedoppgaver |
| [API og kontrakter](domenekontekst/api-og-kontrakter.md) | API-klienter, DTO-er og runtime-validering |
| [Behandling og attestering](domenekontekst/behandling-og-attestering.md) | statuser, handlinger og attestering |
| [Utbetaling og simulering](domenekontekst/utbetaling-og-simulering.md) | beregning, simulering, oversending og kvittering |
| [Brev og dokument](domenekontekst/brev-og-dokument.md) | forhåndsvisning, valg og distribusjon |
| [Regulering, stans og gjenopptak](domenekontekst/regulering-stans-og-gjenopptak.md) | separate endringsflyter |
| [Klage og tilbakekreving](domenekontekst/klage-og-tilbakekreving.md) | egne tilstandsmaskiner og attestering |
| [Autentisering og tilgang](domenekontekst/autentisering-og-tilgang.md) | Wonderwall, JWT, OBO, roller og tilgang |
| [UI-tilstand og feilhåndtering](domenekontekst/ui-tilstand-og-feilhåndtering.md) | RemoteData, feil og tomtilstander |
| [Observerbarhet](domenekontekst/observerbarhet.md) | korrelasjons-ID, BFF-logging og klientfeil |
| [Aksel og tilgjengelighet](domenekontekst/aksel-og-tilgjengelighet.md) | designsystem og universell utforming |
| [Eksterne repoer](domenekontekst/eksterne-repos.md) | systemgrenser og kildestatus |
| [Avklaringer](domenekontekst/avklaringer.md) | forhold som ikke skal brukes som gjeldende fakta |

## Historikk og læring

- [Frontend-skillregisteret](frontend-skills.md) forklarer når installerte
  arbeidsflyter skal brukes og hvilke repoavgrensninger som gjelder.
- [Prosesslæring](agents/su-frontend-ekspert.lessons.jsonl) gjelder agentens
  arbeidsmåte, ikke domenet.
- [Godkjente avvik](ai-historikk/avvik.jsonl) er avgrensede unntak uten presedens.
- [Endringer](ai-historikk/endringer.jsonl) gjelder dette AI-oppsettet og
  domenedokumentasjonen.
