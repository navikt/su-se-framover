import { Nullable } from '~lib/types';

import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Simulering } from './Simulering';

export interface Regulering {
    id: string;
    fnr: string;
    opprettet: string;
    sakId: string;
    saksnummer: number;
    reguleringType: ReguleringType;
    jobbType: JobbType;
    erFerdigstilt: boolean;
    beregning: Nullable<Beregning>;
    simulering: Nullable<Simulering>;
    grunnlagsdataOgVilkårsvurderinger: GrunnlagsdataOgVilkårsvurderinger;
}

interface JobbType {
    type: 'G';
    dato: string;
}

export enum ReguleringType {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}
