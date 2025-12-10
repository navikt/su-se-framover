import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';

import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { TilbakekrevingsVurdering } from '~src/types/ManuellTilbakekrevingsbehandling';
import { eqStringPeriode, Periode } from '~src/types/Periode';

export interface VurderTilbakekrevingFormData {
    grunnlagsperioder: GrunnlagsperiodeFormData[];
}

interface GrunnlagsperiodeFormData {
    periode: Periode<string>;
    vurdering: Nullable<TilbakekrevingsVurdering>;
}

const eqGrunnlagsperiodeFormData = struct<GrunnlagsperiodeFormData>({
    periode: eqStringPeriode,
    vurdering: eqNullable(S.Eq),
});

export const eqVurderTilbakekrevingFormData = struct<VurderTilbakekrevingFormData>({
    grunnlagsperioder: getEq(eqGrunnlagsperiodeFormData),
});

export const vurderTilbakekrevingSchema = yup.object<VurderTilbakekrevingFormData>({
    grunnlagsperioder: yup
        .array<GrunnlagsperiodeFormData>(
            yup
                .object<GrunnlagsperiodeFormData>({
                    periode: yup
                        .object<Periode<string>>({
                            fraOgMed: yup.string().required(),
                            tilOgMed: yup.string().required(),
                        })
                        .required(),
                    vurdering: yup
                        .mixed<TilbakekrevingsVurdering>()
                        .oneOf([
                            TilbakekrevingsVurdering.SKAL_IKKE_TILBAKEKREVES,
                            TilbakekrevingsVurdering.SKAL_TILBAKEKREVES,
                        ])
                        .required(),
                })
                .required(),
        )
        .required(),
});
