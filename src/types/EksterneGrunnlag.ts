import { Nullable } from '~src/lib/types';

import { Skattegrunnlag } from './skatt/Skatt';

export interface EksterneGrunnlag {
    skatt: Nullable<EksternGrunnlagSkatt>;
}

export interface EksternGrunnlagSkatt {
    søkers: Skattegrunnlag;
    eps: Nullable<Skattegrunnlag>;
}
