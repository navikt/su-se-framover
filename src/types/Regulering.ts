import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Periode } from './Periode';
import { Simulering } from './Simulering';

export interface Regulering {
    id: string;
    fnr: string;
    opprettet: string;
    sakId: string;
    saksnummer: number;
    periode: Periode<string>;
    reguleringstype: Reguleringstype;
    jobbType: JobbType;
    erFerdigstilt: boolean;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    saksbehandler: string;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
    avsluttet: { begrunnelse: string };
    årsakForManuell: ÅrsakForManuell[];
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

interface JobbType {
    type: 'G';
    dato: string;
}

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}
