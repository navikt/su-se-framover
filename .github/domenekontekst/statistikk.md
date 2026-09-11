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

Utfall teller hver behandling én gang, i perioden der den første avsluttende
hendelsen går til `IVERKSATT` eller `AVSLUTTET`, og for klager også
`OVERSENDT`. `AVBRUTT` er et resultat, ikke en status.
Begrunnelsen hentes fra den samme hendelsen. Senere endringer påvirker ikke
historiske utfall.

Hovedvisningen summerer utfallshendelser over hele den valgte perioden.
Detaljvisningen viser hver delperiode for seg.

Beholdningen er et punktmål ved slutten av perioden. Backend utelater
`IVERKSATT`, `AVSLUTTET` og `OVERSENDT`. Den viser dermed
behandlinger som fortsatt var åpne hos vedtaksinstansen. Beholdning skal ikke
summeres mellom perioder.

Statusen er den siste registrerte statusen ved måletidspunktet. `REGISTRERT`
betyr derfor at ingen senere statusovergang er registrert før periodens slutt.
Det beviser ikke at ingen annen aktivitet har skjedd i behandlingen.

Liggetiden fordeler behandlinger i restanse i intervallene 0–7, 8–30, 31–60,
61–90 og over 90 dager. En behandling er i restanse når den ikke er avsluttet.
Liggetiden regnes fra `mottattTid` til rapporteringstidspunktet ved slutten av
perioden.
Målingen `TID_I_NÅVÆRENDE_STATUS` vises som «Tid i status ved periodens slutt»
og regnes fra tidspunktet for siste statusovergang til den samme sluttdatoen.
Målingene beskriver de samme behandlingene og skal ikke summeres med hverandre.
Hovedvisningen viser siste øyeblikksbilde med liggetidsfordelingen og tiden i
nåværende status.
Historikken viser beholdningen og antallet over 90 dager for hver tidligere
delperiode. Dette gjør utviklingen sammenlignbar uten å gjenta to komplette
krysstabeller per periode.
Hvert historiske øyeblikksbilde bruker statusen og alderen behandlingen hadde
ved slutten av den aktuelle delperioden, ikke dagens status eller alder. Når
behandlingen får en avsluttende hendelse, inngår den ikke i senere
beholdningsbilder. Sammenligning mellom periodene viser utviklingen i
liggetidsfordelingen for behandlingene i restanse, ikke utviklingen til hver enkelt
behandling. Kohortene brukes til å følge behandlinger fra mottak til
avsluttende hendelse.

Responsen inneholder intervaller og antall, men ikke summen av liggedager eller
gjennomsnittlig liggetid. Frontend skal derfor ikke anslå gjennomsnittlig
liggetid fra intervallene. Et slikt gjennomsnitt krever et eksakt aggregat fra
backend.

For `TID_I_NÅVÆRENDE_STATUS` betyr intervallet over 90 dager at den siste
registrerte statusovergangen skjedde for mer enn 90 dager siden. For statusen
`REGISTRERT` betyr det at behandlingen fortsatt hadde sin første registrerte
status ved måletidspunktet.

### Omarbeid og kohorter

Omarbeid omfatter behandlinger som fikk en avsluttende hendelse i perioden. De
fordeles etter om de har ingen, én eller flere underkjenninger.
Underkjenningsandelen er antall ferdigbehandlede søknadsbehandlinger eller
revurderinger med minst én underkjenning, delt på alle ferdigbehandlede
behandlinger i den samme gruppen. Åpne behandlinger inngår ikke.
Hovedvisningen summerer tellerne for hele den valgte perioden. Delperiodene
vises separat.

Backend må legge til `behandlingerMedTidsmåling` før frontend kan bruke
omarbeidsmedianen etter den avklarte regelen. Frontend skal skjule medianen ved
færre enn fem målinger, merke 5–9 som «få behandlinger» og vise minst ti uten
særskilt merknad. Frontend skal ikke beregne en samlet median fra
delperiodemedianer.

Kohortene grupperer behandlinger etter perioden som inneholder `mottattTid`.
Registrerte behandlinger grupperes etter `registrertTid`. Tallene kan derfor
avvike. Behandlingen følges til første avsluttende hendelse: `IVERKSATT` eller
`AVSLUTTET`, og for klage også `OVERSENDT`. `AVBRUTT` er et resultat, ikke en
status. For hver frist på 30, 60 og 90 dager
oppgir `grunnlag` hvor mange behandlinger som har hatt hele fristen, og
`ferdige` hvor mange av disse som fikk en avsluttende status innen fristen.
`åpneVedTilOgMed` er behandlinger uten avsluttende hendelse ved rapportperiodens
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
siste hendelse, antall behandlinger og antall behandlinger med flere
avsluttende hendelser. Utfallstallene bruker bare den første avsluttende
hendelsen per behandling.

### Behandlingstid

Total behandlingstid går fra `mottattTid` til første
`IVERKSATT` eller `AVSLUTTET`, og for klage også `OVERSENDT`. For søknad og revurdering
heter målingen «Total behandlingstid». For klage heter den «Klagebehandling hos
oss», fordi `OVERSENDT` avslutter behandlingen hos førsteinstansen.

Fasemålingene er:

- siste sammenhengende saksbehandlingssteg før attestering; steget kan starte i
  `UNDER_BEHANDLING`
- tid hos attestant, fra sendt til attestering til iverksatt eller underkjent
- underkjent til sendt til attestering på nytt

Klage får ikke fasemålingene fordi sakstatistikken ikke lager egne
`TIL_ATTESTERING`- eller `UNDERKJENT`-hendelser for klage. En behandling kan
bidra med flere fasemålinger etter gjentatte underkjenninger.

Fasemålingen etter underkjenning gjelder én overgang. Omarbeidsmedianen gjelder
samlet omarbeidstid per ferdig behandling. Frontend bruker ulike navn på
målingene fordi antall og verdi kan avvike.

### Utfall, begrunnelser og hjemler

`utfall` teller hver behandling én gang, i perioden der behandlingen først
får `IVERKSATT` eller `AVSLUTTET`, og for klage også `OVERSENDT`. For klage betyr
`OVERSENDT` at behandlingen er ferdig hos vedtaksinstansen. Senere avsluttende
hendelser kan ikke brukes som avgang i flytbalansen.

Backend skal returnere beholdning ved start, registrerte behandlinger, unike
ferdigbehandlede behandlinger, beholdning ved slutt og avvik per periode,
kategori og ytelse. Frontend skal ikke utlede denne flytbalansen fra dagens
utfallshendelser.

For søknad kan frontend vise «andel innvilget blant søknadsvedtak» når
utfallene er unike behandlinger. Andelen er `INNVILGET / (INNVILGET + AVSLAG)`.
`AVVIST`, `AVBRUTT`, `BORTFALT` og `TRUKKET` inngår ikke.
Andre behandlingskategorier trenger egne mål.

Fristene 30, 60 og 90 dager beholdes. Backend normaliserer historiske
`OpphørtRevurdering` til `OPPHØRT`, `Feilregistrert` og `FEILREGISTRERT` til
`BORTFALT`, og `AVSLAG` til `AVVIST` bare for klager. For søknader er `AVSLAG`
og `AVVIST` fortsatt separate resultater fordi betydningen ikke er faglig
avklart. Frontend viser manglende resultat eksplisitt som «MANGLER RESULTAT».

Hver periode inneholder egne fordelinger for søknadsavslag,
revurderingsopphør, avviste klager, klagehjemler og klageomgjøring. Fordelingene
har eksplisitte nevnere og egne tall for manglende og ukjente verdier.
Begrunnelser og hjemler kan overlappe. Frontend summerer derfor ikke radene og
bruker ikke stablede diagrammer.

Frontend viser totalsum og andel for hele den valgte perioden. Endring beregnes
mellom de to siste hele delperiodene. En ufullstendig måned, uke eller årsperiode
sammenlignes ikke prosentvis med en full periode.

Frontend viser utviklingen i gjennomsnittlig total behandlingstid. Målingene kan
gjelde ulike grupper behandlinger og skal ikke legges sammen. Varigheter under
ett døgn vises i timer eller minutter, ikke som `0,0 dager`.

Årsoppløsning kan velges når rapportperioden dekker minst 12 måneder. Første og
siste delperiode kan fortsatt dekke bare deler av kalenderåret. Slike
delperioder merkes med de faktiske datoene og skal ikke sammenlignes som om de
var like lange.

Aggregatversjon 7 grupperer kohorter etter `mottattTid` og registrerte
behandlinger etter `registrertTid`. Den normaliserer også historiske
resultatverdier som beskrevet over. Eldre cachede aggregater genereres på nytt.

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
