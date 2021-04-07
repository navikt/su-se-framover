import { OpprettetRevurderingGrunn } from '../../types/Revurdering';

import sharedMessages from './sharedMessages-nb';

export function getRevurderingsårsakMessageId(årsak: OpprettetRevurderingGrunn): keyof typeof sharedMessages {
    switch (årsak) {
        case OpprettetRevurderingGrunn.MELDING_FRA_BRUKER:
            return 'årsak.meldingFraBruker';
        case OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE:
            return 'årsak.informasjonFraKontrollsamtale';
        case OpprettetRevurderingGrunn.DØDSFALL:
            return 'årsak.dødsfall';
        case OpprettetRevurderingGrunn.ANDRE_KILDER:
            return 'årsak.andreKilder';
        case OpprettetRevurderingGrunn.MIGRERT:
            return 'årsak.migrert';
    }
}
