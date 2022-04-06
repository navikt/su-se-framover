import { Nullable } from '~src/lib/types';

import { Beregning } from './Beregning';
import { GrunnlagsdataOgVilkårsvurderinger } from './grunnlagsdataOgVilkårsvurderinger/grunnlagsdataOgVilkårsvurderinger';
import { Simulering } from './Simulering';

export interface Regulering {
    id: string;
    fnr: string;
    opprettet: string;
    sakId: string;
    saksnummer: number;
    reguleringstype: Reguleringstype;
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

export enum Reguleringstype {
    AUTOMATISK = 'AUTOMATISK',
    MANUELL = 'MANUELL',
}
