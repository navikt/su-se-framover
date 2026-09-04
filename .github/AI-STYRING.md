# AI-støtte i su-se-framover

Repositoryet bruker ett kanonisk regelsett og tynne verktøyinnganger. Målet er at
ulike AI-verktøy følger samme regler uten at kopier driver fra hverandre.

## Start her

1. Les [`../AGENTS.md`](../AGENTS.md).
2. Les [kunnskapshuben](su-frontend-ekspert.md) når oppgaven krever domene-, API-,
   auth-, BFF-, Aksel- eller tilgjengelighetsforståelse.
3. Les relevante filavgrensede instruksjoner.
4. Gjennomfør regelkontrollen før og etter en endring.

## Verktøystøtte

| Verktøy | Inngang |
|---|---|
| GitHub Copilot | [`copilot-instructions.md`](copilot-instructions.md), som peker til `AGENTS.md` |
| OpenAI Codex | Leser `AGENTS.md` |
| Cursor | Ingen egen adapter er konfigurert; bruk `AGENTS.md` der funksjonen støttes |
| Claude Code | [`../CLAUDE.md`](../CLAUDE.md) importerer bare `AGENTS.md` |
| Gemini CLI | [`../GEMINI.md`](../GEMINI.md) importerer bare `AGENTS.md` |
| JetBrains Junie | Ingen egen adapter er konfigurert; pek verktøyet til `AGENTS.md` ved behov |

Ikke opprett en ny kopi av reglene for et verktøy. Lag bare en minimal adapter
dersom verktøyet ikke kan lese `AGENTS.md`.

Verktøystøtte og oppdagelsesregler kan endres mellom versjoner. Kontroller mot
offisiell dokumentasjon før en ny adapter legges til:

- [GitHub Copilot repository instructions](https://docs.github.com/en/copilot/customizing-copilot/adding-repository-custom-instructions-for-github-copilot)
- [OpenAI Codex og `AGENTS.md`](https://developers.openai.com/codex/guides/agents-md/)
- [Claude Code memory og imports](https://code.claude.com/docs/en/memory)
- [Gemini CLI og `GEMINI.md`](https://geminicli.com/docs/cli/gemini-md/)
- [Cursor project rules](https://cursor.com/docs/context/rules)
- [JetBrains Junie guidelines](https://www.jetbrains.com/help/junie/customize-guidelines.html)

## Struktur og ansvar

| Fil eller katalog | Ansvar |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Kanoniske, verktøyuavhengige regler |
| [`copilot-instructions.md`](copilot-instructions.md) | Tynn Copilot-inngang |
| [`instructions/typescript.instructions.md`](instructions/typescript.instructions.md) | Filavgrensede TypeScript-/React-regler |
| [`instructions/bff.instructions.md`](instructions/bff.instructions.md) | Filavgrensede Express-, auth- og proxyregler |
| [`agents/su-frontend-ekspert.agent.md`](agents/su-frontend-ekspert.agent.md) | Valgbar frontend-, BFF-, auth- og domenesparringspartner |
| [`agents/su-frontend-ekspert.lessons.jsonl`](agents/su-frontend-ekspert.lessons.jsonl) | Varig prosesslæring |
| [`frontend-skills.md`](frontend-skills.md) | Register og repoavgrensning for installerte frontend-skills |
| [`skills.lock.json`](skills.lock.json) | Full upstream-commit og innholdshasher for installerte skills |
| [`skills/`](skills/) | Skills fra `navikt/copilot`, lest direkte av Copilot CLI |
| [`workflows/copilot-setup-steps.yml`](workflows/copilot-setup-steps.yml) | Deterministisk avhengighetsoppsett for Copilot cloud agent |
| [`su-frontend-ekspert.md`](su-frontend-ekspert.md) | Kunnskapshub |
| [`domenekontekst/`](domenekontekst/) | Verifiserte fakta og avklaringer |
| [`ai-historikk/avvik.jsonl`](ai-historikk/avvik.jsonl) | Eksplisitt godkjente, avgrensede unntak |
| [`ai-historikk/endringer.jsonl`](ai-historikk/endringer.jsonl) | Endringer i AI-regler, agentprofil og domenedokumentasjon |
| [`../CLAUDE.md`](../CLAUDE.md) | Minimal Claude-import |
| [`../GEMINI.md`](../GEMINI.md) | Minimal Gemini-import |

## Hold lagene adskilt

- **Regler** er normativ praksis i `AGENTS.md` eller en filavgrenset instruksjon.
- **Domenefakta** er verifisert oppførsel i en temafil.
- **Avklaringer** er uavklarte, historiske eller avkreftede påstander.
- **Prosesslæring** forbedrer agentens arbeidsmåte og inneholder ikke domenefakta.
- **Skills** gir oppgavespesifikke arbeidsflyter og referanser, men er ikke
  normative over `AGENTS.md` eller filinstruksjonene. Absolutte formuleringer i
  en skill må kontrolleres manuelt mot lokale regler før bruk.
- **Avvik** er eksplisitt godkjente unntak for et avgrenset scope.
- **Endringshistorikk** gjelder AI-oppsettet og domenedokumentasjonen. Git
  dokumenterer ordinære kodeendringer.

## Regelkontroll og overstyring

Før en AI-endring skal agenten finne gjeldende regler, kontrollere plan og
domenefakta og rapportere relevant mismatch med konsekvens og regelkonformt
alternativ. Et avvik krever eksplisitt godkjenning og registrering før oppgaven
avsluttes. Etter endringen kontrolleres resultatet mot både reglene og avvikets
scope.

Et avvik er ikke presedens. Lov-, personvern- og sikkerhetskrav kan ikke
overstyres gjennom loggen.

## JSONL-format

Bruk én gyldig JSON-verdi per ikke-tom linje. Ikke lagre personopplysninger,
tokens, hemmeligheter eller navnet på den som godkjente.

Prosesslæring:

```json
{"date":"YYYY-MM-DD","type":"process-learning","summary":"varig læring om arbeidsmåte","evidence":["grunnlag"]}
```

Opprettet avvik:

```json
{"eventId":"unik-hendelse","deviationId":"stabil-avviks-id","eventType":"created","effectiveAt":"YYYY-MM-DDTHH:mm:ssZ","rule":"regel eller filreferanse","scope":["sti eller komponent"],"reason":"begrunnelse","decision":"godkjent løsning","approval":"PR, issue eller annen ikke-personlig beslutningsreferanse","consequences":"kjente følger","status":"active","revisit":"dato eller hendelse","evidence":["grunnlag"]}
```

Statusendring for et eksisterende avvik:

```json
{"eventId":"ny-unik-hendelse","deviationId":"samme-stabile-avviks-id","eventType":"status-changed","effectiveAt":"YYYY-MM-DDTHH:mm:ssZ","status":"expired","supersedesEventId":"forrige-hendelse","reason":"hvorfor statusen ble endret","evidence":["grunnlag"]}
```

Endring i AI-oppsettet:

```json
{"date":"YYYY-MM-DD","type":"governance-change","summary":"endring","reason":"begrunnelse","files":["berørte filer"],"evidence":["grunnlag"]}
```

`files` kan inneholde fil- eller katalogstier. En katalogsti betyr alle filer
under katalogen som ble berørt av den beskrevne endringen.

Hver ikke-tomme linje skal være et JSON-objekt. `eventId` er unik,
`deviationId` er stabil gjennom hele livsløpet, og en statusendring peker på
forrige hendelse med `supersedesEventId`. Gjeldende status er siste gyldige
hendelse sortert på `effectiveAt`; filrekkefølge avgjør ved likt tidspunkt.
Avviksstatus er `active`, `expired` eller `superseded`. Historiske hendelser
beholdes.

## Vedlikehold uten duplisering

- Endre felles regler i `AGENTS.md`.
- Hold verktøyadaptere minimale.
- Endre TypeScript-regler bare i den filavgrensede instruksjonen og oppsummer
  viktige tverrgående regler kort i `AGENTS.md`.
- Oppdater domenefilen som eier faktumet; legg usikkerhet i `avklaringer.md`.
- Promoter bare generell, varig prosesslæring til en regel.
- Før styringsendringen i `endringer.jsonl`; bruk Git for ordinær kodehistorikk.
