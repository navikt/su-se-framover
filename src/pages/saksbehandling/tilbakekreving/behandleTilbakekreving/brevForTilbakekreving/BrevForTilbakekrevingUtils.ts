import * as B from 'fp-ts/lib/boolean';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface BrevForTilbakekrevingFormData {
    skalSendeBrev: boolean;
    brevtekst: Nullable<string>;
    notat: string;
}

export const eqBrevForTilbakekrevingFormData = struct<BrevForTilbakekrevingFormData>({
    skalSendeBrev: B.Eq,
    brevtekst: eqNullable(S.Eq),
    notat: S.Eq,
});

export const brevForTilbakekrevingSchema = yup.object<BrevForTilbakekrevingFormData>({
    skalSendeBrev: yup.boolean().required(),
    brevtekst: yup
        .string()
        .when('skalSendeBrev', {
            is: true,
            then: yup.string().required(),
        })
        .defined(),
    notat: yup.string(),
});
