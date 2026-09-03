# Aksel og tilgjengelighet

## Verifisert grunnlag

Repositoryet bruker Aksel-komponenter, ikoner og globale stiler.
`biome.json` håndhever en eksplisitt samling a11y-regler, blant annet gyldige
ARIA-attributter, tekstalternativ, etiketter, tastaturhendelser og forbud mot
positiv `tabIndex`.

Applikasjonsskallet har:

- hopp-lenke til hovedinnhold
- semantisk `<main>`
- dokumenttitler per hovedrute
- Aksel `Loader`, `Alert`, skjemakomponenter og knapper

## Teamregler

- Bruk Aksel før egenimplementerte komponenter, ikoner og designverdier.
- Bruk semantisk HTML før ARIA.
- Alle interaktive handlinger skal kunne brukes med tastatur og ha synlig fokus.
- Skjemafelt skal ha tilgjengelig navn og feil knyttet til feltet.
- Ved side- eller kontekstskifte skal fokus håndteres slik at brukeren forstår
  resultatet.
- Loading, feil, suksess og tomtilstand skal formidles forståelig, ikke bare med
  farge eller visuell plassering.
- Mikrotekst skal beskrive handling og konsekvens presist og på norsk.
- Kontroller skjermleserrekkefølge og overskriftshierarki ved større
  sideendringer.

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
