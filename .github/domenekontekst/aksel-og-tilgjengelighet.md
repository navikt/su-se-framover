# Aksel og tilgjengelighet

> Kildestatus: `verified` mot statisk frontendkode og konfigurasjon. Dette er
> ikke en full atferdstest eller dokumentasjon av WCAG-samsvar.

## Verifisert grunnlag

Repositoryet bruker Aksel-komponenter, ikoner og globale stiler.
`biome.json` håndhever en eksplisitt samling a11y-regler, blant annet gyldige
ARIA-attributter, tekstalternativ, etiketter, tastaturhendelser og forbud mot
positiv `tabIndex`.

Applikasjonsskallet har:

- hopp-lenke til hovedinnhold
- semantisk `<main>`
- `WithDocTitle` og `useDocTitle` for dokumenttitler på deler av rutestrukturen
- Aksel `Loader`, `Alert`, skjemakomponenter og knapper

Dokumenttitler er ikke verifisert for alle ruter. Nye eller endrede ruter må
kontrolleres eksplisitt mot kravet om en beskrivende sidetittel.

## Relevant styring

Normative regler for Aksel, semantisk HTML, tastatur, fokus, skjermleser og
mikrotekst ligger i
[`typescript.instructions.md`](../instructions/typescript.instructions.md).
Denne filen dokumenterer det verifiserte grunnlaget for reglene.

Biomes regler er en minimumskontroll. De beviser ikke alene samsvar med WCAG
2.1/2.2 eller kravene til universell utforming.

## Kilder

- `package.json`
- `biome.json`
- `src/externalStyles.ts`
- `src/Root.tsx`
- `src/utils/router/ContentWrapper.tsx`
- `src/components/`
- `src/pages/`
