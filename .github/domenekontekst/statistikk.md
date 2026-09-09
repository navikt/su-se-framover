# Statistikk

> Kildestatus: `cross-repo`, kontrollert mot frontendimplementasjonen og
> statistikkflyten i `navikt/su-se-bakover` 9. september 2026.

## Sakstatistikk

Felles saksbehandlingsstatistikk skiller mellom:

- `behandlingType`: hva slags behandling som utføres
- `behandlingAarsak`: hvorfor behandlingen ble opprettet
- `behandlingStatus`: hvor behandlingen er i saksbehandlingen
- `behandlingResultat`: konklusjonen behandlingen førte til

Dette er separate analysedimensjoner. Årsaken til opprettelsen skal ikke
presenteres som et utfall, og et utfall i én periode kan tilhøre en behandling
som startet i en tidligere periode.

Den nye statistikkresponsen omfatter kategoriene søknad, revurdering, klage,
stans, gjenopptak og tilbakekreving. G-regulering filtreres ut i backend.
Kategorien `REGULERING` og feltet `behandlingMetode` inngår ikke i kontrakten.

### Registrerte behandlinger

En behandling telles i perioden som inneholder `registrertTid`. Den grupperes
etter kategori, ytelse og `behandlingAarsak` fra opprettelseshendelsen. Senere
endringer i årsaken flytter ikke den historiske registreringen.

Hovedvisningen summerer registrerte behandlinger over hele den valgte perioden.
Detaljvisningen viser hver delperiode for seg.

`behandlingAarsak` brukes slik:

- Søknad har vanligvis ingen årsak. En omgjøringssøknad kan ha
  `OMGJORING_ETTER_AVSLAG`. Eldre rådata kan inneholde den misvisende verdien
  `OMGJORING_ETTER_AVVIST`; begge skal vises som «Ny behandling av tidligere
  avslag».
  En slik omgjøring er en ny søknadsbehandling som bygger på en tidligere
  avslagsbehandling, ikke en ny søknad fra brukeren.
- Revurdering, stans og gjenopptak har normalt en revurderingsårsak.
- Klage har ikke behandlingsårsak i statistikkhendelsene.
- Betydningen av behandlingsårsak for tilbakekreving er ikke avklart.

`null` betyr bare at statistikkhendelsen ikke har en lagret årsak. Kontrakten
skiller ikke mellom manglende og irrelevant årsak. Frontend skjuler derfor
årsaken når verdien er `null`.

### Utfall og beholdning

Utfall teller hendelser som går til `IVERKSATT`, `AVSLUTTET`, `AVBRUTT` eller
`OVERSENDT`. Tallene er ikke nødvendigvis unike behandlinger. Like statuser som
følger direkte etter hverandre, slås sammen, men samme behandling kan få flere
utfall over tid.

Hovedvisningen summerer utfallshendelser over hele den valgte perioden.
Detaljvisningen viser hver delperiode for seg.

Beholdningen er et punktmål ved slutten av perioden. Backend utelater
`IVERKSATT`, `AVSLUTTET`, `AVBRUTT` og `OVERSENDT`. Den viser dermed
behandlinger som fortsatt var åpne hos vedtaksinstansen. Beholdning skal ikke
summeres mellom perioder.

Statusen er den siste registrerte statusen ved måletidspunktet. `REGISTRERT`
betyr derfor at ingen senere statusovergang er registrert før periodens slutt.
Det beviser ikke at ingen annen aktivitet har skjedd i behandlingen.

Beholdningsalderen fordeler behandlingene i intervallene 0–7, 8–30, 31–60,
61–90 og over 90 dager. Behandlingens totale alder regnes fra `mottattTid`.
Målingen `TID_I_NÅVÆRENDE_STATUS` vises som «Tid i status ved periodens slutt»
og regnes fra tidspunktet for siste statusovergang til den samme sluttdatoen.
Målingene beskriver de samme behandlingene og skal ikke summeres med hverandre.
Hovedvisningen viser siste øyeblikksbilde med begge aldersfordelingene.
Historikken viser beholdningen og antallet over 90 dager for hver tidligere
delperiode. Dette gjør utviklingen sammenlignbar uten å gjenta to komplette
krysstabeller per periode.
Hvert historiske øyeblikksbilde bruker statusen og alderen behandlingen hadde
ved slutten av den aktuelle delperioden, ikke dagens status eller alder. Når
behandlingen får en avsluttende status, inngår den ikke i senere
beholdningsbilder. Sammenligning mellom periodene viser utviklingen i
aldersfordelingen for den åpne beholdningen, ikke utviklingen til hver enkelt
behandling. Kohortene brukes til å følge behandlinger fra mottak til
avsluttende status.

For `TID_I_NÅVÆRENDE_STATUS` betyr intervallet over 90 dager at den siste
registrerte statusovergangen skjedde for mer enn 90 dager siden. For statusen
`REGISTRERT` betyr det at behandlingen fortsatt hadde sin første registrerte
status ved måletidspunktet.

### Omarbeid og kohorter

Omarbeid omfatter behandlinger som fikk en avsluttende status i perioden. De
fordeles etter om de har ingen, én eller flere underkjenninger. Medianen er
samlet tid fra hver underkjenning til ny attestering per behandling. Den gjelder
én periode og én ytelse og skal ikke slås sammen mellom perioder eller ytelser.

Kohortene grupperer behandlinger etter perioden som inneholder `mottattTid`.
Behandlingen følges til første avsluttende status: `IVERKSATT`, `AVSLUTTET` eller
`AVBRUTT`, og for klage også `OVERSENDT`. For hver frist på 30, 60 og 90 dager
oppgir `grunnlag` hvor mange behandlinger som har hatt hele fristen, og
`ferdige` hvor mange av disse som fikk en avsluttende status innen fristen.
`åpneVedTilOgMed` er behandlinger uten avsluttende status ved rapportperiodens
slutt. Oversendte klager inngår derfor ikke. Tallet gjelder bare behandlinger
som ble mottatt i den valgte perioden. Beholdningen kan i tillegg inneholde
eldre behandlinger som ble mottatt før periodestart.

Kohortene brukes til å sammenligne hvor raskt behandlinger fra forskjellige
mottaksperioder blir ferdige. Behandlinger som ikke har rukket å få hele
30-, 60- eller 90-dagersfristen, inngår ikke i grunnlaget for den aktuelle
fristen og skal ikke tolkes som forsinkede.

Hovedvisningen summerer tellerne og grunnlagene for alle mottaksperioder i det
valgte tidsrommet. Prosentene beregnes fra de summerte tellerne og grunnlagene,
ikke som et gjennomsnitt av periodeprosentene. `åpneVedTilOgMed` kan summeres
fordi hver behandling tilhører én kohort og alle kohortene måles på samme
rapportdato. Den summerte raden merkes med hele den valgte rapportperioden,
også når en ytelse ikke har mottak i den siste delperioden.

### Metadata

Sakresponsen inneholder aggregatversjon, høyeste sekvens-ID, tidspunktet for
siste hendelse, antall behandlinger og antall behandlinger med flere utfall.
Når behandlinger har flere utfall, er antall statusoverganger ikke det samme som
antall behandlinger.

### Behandlingstid

Total behandlingstid går fra `mottattTid` til første
`IVERKSATT`, `AVSLUTTET`, `AVBRUTT` eller `OVERSENDT`. For søknad og revurdering
heter målingen «Total behandlingstid». For klage heter den «Klagebehandling hos
oss», fordi `OVERSENDT` avslutter behandlingen hos førsteinstansen.

Fasemålingene er:

- registrert til sendt til attestering
- tid hos attestant, fra sendt til attestering til iverksatt eller underkjent
- underkjent til sendt til attestering på nytt

Klage får ikke fasemålingene fordi sakstatistikken ikke lager egne
`TIL_ATTESTERING`- eller `UNDERKJENT`-hendelser for klage. En behandling kan
bidra med flere fasemålinger etter gjentatte underkjenninger.

Frontend viser utviklingen i gjennomsnittlig total behandlingstid. Målingene kan
gjelde ulike grupper behandlinger og skal ikke legges sammen. Varigheter under
ett døgn vises i timer eller minutter, ikke som `0,0 dager`.

Årsoppløsning kan velges når rapportperioden dekker minst 12 måneder. Første og
siste delperiode kan fortsatt dekke bare deler av kalenderåret. Slike
delperioder merkes med de faktiske datoene og skal ikke sammenlignes som om de
var like lange.

Aggregatversjon 4 innførte `registrertTid` for registrerte behandlinger,
`mottattTid` for behandlingstid, kohorter og beholdningsalder samt korrigert
håndtering av oversendte klager. Eldre cachede aggregater genereres på nytt.

## Stønadsstatistikk

Backend velger siste lagrede rad per sak og måned. For én måned kan frontend
omtale tallet som «antall saker i måneden». Det er ikke nødvendigvis antall
personer eller antall vedtak som ble fattet den måneden.

Samme sak kan forekomme i flere måneder. En sum over flere måneder skal derfor
omtales som «summen av månedlige saksforekomster», ikke antall unike saker eller
personer.

Frontend viser gjennomsnittlig antall saker per tilgjengelig måned i den valgte
perioden, ikke summen av månedsforekomstene. For én valgt måned sammenlignes
måneden med forrige kalendermåned. For lengre perioder sammenlignes første og
siste tilgjengelige måned.

Hver periode har `datagrunnlag` med verdien `TILGJENGELIG` eller `MANGLER`.
Frontend viser 0 når datagrunnlaget er tilgjengelig og `rader` er tom. Ved
`MANGLER` vises «Mangler data», og frontend beregner ikke endring fra forrige
kalendermåned.

`bestandsendringerTilgjengelig` er bare sann når både måneden og foregående
måned er generert. En sann verdi og tom `bestandsendringer` betyr at måneden
ikke har bestandsendringer. En usann verdi betyr at månedene ikke kan
sammenlignes. Endringene viser nye, videreførte og utgåtte saker samt saker med
endret stønadsklassifisering. De vises per måned og summeres ikke.

Bestandsendringer kan filtreres etter stønadstype. Responsen har ikke
vedtakstype, vedtaksresultat eller stønadsklassifisering på disse radene.
Frontend skjuler derfor endringene når et av disse filtrene er valgt.

`REGULERING` er fortsatt en gyldig vedtakstype i stønadsstatistikken. En slik
rad representerer en sak som har stønad i måneden, på samme måte som de andre
vedtakstypene. Den skal ikke filtreres bort i frontend.

Både sak- og stønadsstatistikk tillater maksimalt to års rapportperiode.

## Kilder

- «Teknisk beskrivelse av behov til felles saksbehandlingsstatistikk»,
  Confluence, oppdatert 16. mars 2026
- «Kategorier / dimensjoner i saksbehandlingsstatistikk», Confluence, oppdatert
  19. februar 2026
- `src/types/Statistikk.ts`
- `src/api/statistikkApi.ts`
- `src/pages/drift/statistikk/`
- `navikt/su-se-bakover#2983`
- `domain/src/main/kotlin/no/nav/su/se/bakover/domain/statistikk/StatistikkVisningRepo.kt`
- `service/src/main/kotlin/no/nav/su/se/bakover/service/statistikk/StatistikkVisningService.kt`
