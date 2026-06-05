import { Nullable } from '~src/lib/types';
import { Attestering } from '~src/types/Behandling';
import { Beregning } from './Beregning';
import { Fradragskategori } from './Fradrag';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode } from './Periode';
import { Sakstype } from './Sak';
import { Simulering } from './Simulering';

export interface Regulering {
    id: string;
    fnr: string;
    opprettet: string;
    sakId: string;
    saksnummer: number;
    periode: Periode<string>;
    reguleringstype: Reguleringstype;
    erFerdigstilt: boolean;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    saksbehandler: string;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    avsluttet: { tidspunkt: string };
    årsakForManuell: ÅrsakForManuell[];
    sakstype: Sakstype;
    reguleringsstatus: Reguleringsstatus;
    attesteringer: Attestering[];
}

export enum Reguleringsstatus {
    OPPRETTET = 'OPPRETTET',
    BEREGNET = 'BEREGNET',
    ATTESTERING = 'ATTESTERING',
    IVERKSATT = 'IVERKSATT',
    AVSLUTTET = 'AVSLUTTET',
}

export interface ReguleringOversiktsstatus {
    saksnummer: number;
    fnr: string;
    fradragsKategori: Fradragskategori[];
    årsakTilManuellRegulering: ÅrsakTilManuellReguleringKategori[];
}

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}

export enum ÅrsakTilManuellReguleringKategori {
    ManglerRegulertBeløpForFradrag = 'ManglerRegulertBeløpForFradrag',
    ManglerIeuFraPesys = 'ManglerIeuFraPesys',
    YtelseErMidlertidigStanset = 'YtelseErMidlertidigStanset',
    EtAutomatiskFradragHarFremtidigPeriode = 'EtAutomatiskFradragHarFremtidigPeriode',
    UgyldigePerioderForAutomatiskRegulering = 'UgyldigePerioderForAutomatiskRegulering',
    AapManglerGyldigPeriode = 'AapManglerGyldigPeriode',
}

export interface ÅrsakForManuell {
    begrunnelse: Nullable<string>;
    type: ÅrsakTilManuellReguleringKategori;
}

export interface ManuellRegulering {
    gjeldendeVedtaksdata: GrunnlagsdataOgVilkårsvurderinger;
    regulering: Regulering;
}

export enum UnderkjennelseGrunnRegulering {
    REGULERING_ER_FEIL = 'REGULERING_ER_FEIL',
}

export interface ProdusertReguleringStatus {
    id: string;
    produserStatus: string;
    reguleringStatus: Nullable<ReguleringStatusUtestående>;
}

export interface ReguleringStatusUtestående {
    aar: number;
    sisteGrunnbeløpOgSatser: SisteGrunnbeløpOgSatser;
    sakerMedUtebetalingIMai: number;
    sakerMedGammelG: number;
    utenÅpenRegulering: SakMedGammeltGrunnbeløp[];
}

export interface SakMedGammeltGrunnbeløp {
    saksnummer: number;
    type: Sakstype;
    benyttetGrunnbeløp: number | null; // Kun uføre
    benyttetSatskategori: string;
    benyttetSats: number;
}

export interface SisteGrunnbeløpOgSatser {
    grunnbeløp: number;
    garantipensjonOrdinærMåned: number;
    garantipensjonHøyMåned: number;
}
