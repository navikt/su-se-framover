import { Nullable } from '~lib/types';
import { Omgjør, Oppretthold } from '~types/Klage';

export interface VurderingRequest {
    sakId: string;
    klageId: string;
    omgjør: Nullable<Omgjør>;
    oppretthold: Nullable<Oppretthold>;
    fritekstTilBrev: Nullable<string>;
}
