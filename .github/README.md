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
| Cursor | Bruker `AGENTS.md` som prosjektinstruksjon der funksjonen støttes |
| Claude Code | [`../CLAUDE.md`](../CLAUDE.md) importerer bare `AGENTS.md` |
| Gemini CLI | [`../GEMINI.md`](../GEMINI.md) importerer bare `AGENTS.md` |
| JetBrains Junie | Konfigureres til å bruke `AGENTS.md` som prosjektregel |

Ikke opprett en ny kopi av reglene for et verktøy. Lag bare en minimal adapter
dersom verktøyet ikke kan lese `AGENTS.md`.

## Struktur og ansvar

| Fil eller katalog | Ansvar |
|---|---|
| [`../AGENTS.md`](../AGENTS.md) | Kanoniske, verktøyuavhengige regler |
| [`copilot-instructions.md`](copilot-instructions.md) | Tynn Copilot-inngang |
| [`instructions/typescript.instructions.md`](instructions/typescript.instructions.md) | Filavgrensede TypeScript-/React-regler |
| [`agents/su-frontend-ekspert.agent.md`](agents/su-frontend-ekspert.agent.md) | Valgbar frontend-, BFF-, auth- og domenesparringspartner |
| [`agents/su-frontend-ekspert.lessons.jsonl`](agents/su-frontend-ekspert.lessons.jsonl) | Varig prosesslæring |
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

Godkjent avvik:

```json
{"date":"YYYY-MM-DD","id":"unik-id","rule":"regel eller filreferanse","scope":["sti eller komponent"],"reason":"begrunnelse","decision":"godkjent løsning","consequences":"kjente følger","status":"active","revisit":"dato eller hendelse","evidence":["grunnlag"]}
```

Endring i AI-oppsettet:

```json
{"date":"YYYY-MM-DD","type":"governance-change","summary":"endring","reason":"begrunnelse","files":["berørte filer"],"evidence":["grunnlag"]}
```

Avviksstatus er `active`, `expired` eller `superseded`. Behold normalt eldre
oppføringer og endre status gjennom en ny oppføring fremfor å slette historikk.

## Vedlikehold uten duplisering

- Endre felles regler i `AGENTS.md`.
- Hold verktøyadaptere minimale.
- Endre TypeScript-regler bare i den filavgrensede instruksjonen og oppsummer
  viktige tverrgående regler kort i `AGENTS.md`.
- Oppdater domenefilen som eier faktumet; legg usikkerhet i `avklaringer.md`.
- Promoter bare generell, varig prosesslæring til en regel.
- Før styringsendringen i `endringer.jsonl`; bruk Git for ordinær kodehistorikk.
