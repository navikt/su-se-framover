import { IntlShape } from 'react-intl';

import { Nullable } from '~src/lib/types';
import { IngenAdresseGrunn } from '~src/types/Person';

export function ingenAdresseGrunnTekst(grunn: Nullable<IngenAdresseGrunn>, intl: IntlShape): Nullable<string> {
    switch (grunn) {
        case IngenAdresseGrunn.BOR_PÅ_ANNEN_ADRESSE:
            return intl.formatMessage({ id: 'boOgOpphold.ingenAdresseGrunn.annenAdresse' });
        case IngenAdresseGrunn.HAR_IKKE_FAST_BOSTED:
            return intl.formatMessage({ id: 'boOgOpphold.ingenAdresseGrunn.harIkkeFastBosted' });

        default:
            return null;
    }
}
