import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
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
}

export enum Reguleringsstatus {
    OPPRETTET = 'OPPRETTET',
    IVERKSATT = 'IVERKSATT',
    AVSLUTTET = 'AVSLUTTET',
}

export interface ReguleringOversiktsstatus {
    saksnummer: number;
    fnr: string;
    merknader: ReguleringMerknad[];
}

export enum ReguleringMerknad {
    Fosterhjemsgodtgjørelse = 'Fosterhjemsgodtgjørelse',
}

export enum ÅrsakForManuell {
    FradragMåHåndteresManuelt = 'FradragMåHåndteresManuelt',
    YtelseErMidlertidigStanset = 'YtelseErMidlertidigStanset',
    ForventetInntektErStørreEnn0 = 'ForventetInntektErStørreEnn0',
    DelvisOpphør = 'DelvisOpphør',
    VedtakstidslinjeErIkkeSammenhengende = 'VedtakstidslinjeErIkkeSammenhengende',
    PågåendeAvkortingEllerBehovForFremtidigAvkorting = 'PågåendeAvkortingEllerBehovForFremtidigAvkorting',
    AvventerKravgrunnlag = 'AvventerKravgrunnlag',
    UtbetalingFeilet = 'UtbetalingFeilet',
}

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}
