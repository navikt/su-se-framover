import { Nullable } from '~src/lib/types';
import { IngenAdresseGrunn } from '~src/types/Person';

export function ingenAdresseGrunnTekst(grunn: Nullable<IngenAdresseGrunn>): Nullable<string> {
    switch (grunn) {
        case IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE:
            return 'Bor på annen adresse.';
        case IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED:
            return 'Har ikke fast bosted.';
        default:
            return null;
    }
}
