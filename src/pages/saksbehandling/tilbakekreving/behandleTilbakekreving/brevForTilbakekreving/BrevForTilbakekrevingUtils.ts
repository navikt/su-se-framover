import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { Nullable, eqNullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface BrevForTilbakekrevingFormData {
    brevtekst: Nullable<string>;
}

export const eqBrevForTilbakekrevingFormData = struct<BrevForTilbakekrevingFormData>({
    brevtekst: eqNullable(S.Eq),
});

export const brevForTilbakekrevingSchema = yup.object<BrevForTilbakekrevingFormData>({
    brevtekst: yup.string().nullable().required(),
});
