import { Vilkårstatus } from '~src/types/Behandlingsinformasjon';
import { Periode } from '~src/types/Periode';

export interface LovligOppholdGrunnlag {
    periode: Periode;
    resultat: Vilkårstatus;
}
