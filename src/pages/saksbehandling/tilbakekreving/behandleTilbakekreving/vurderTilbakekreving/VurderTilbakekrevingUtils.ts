import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { TilbakekrevingsVurdering } from '~src/types/ManuellTilbakekrevingsbehandling';
import Måned from '~src/types/Måned';

export interface VurderTilbakekrevingFormData {
    grunnlagsperioder: GrunnlagsperiodeFormData[];
}

interface GrunnlagsperiodeFormData {
    måned: Måned;
    vurdering: Nullable<TilbakekrevingsVurdering>;
}

export const vurderTilbakekrevingSchema = yup.object<VurderTilbakekrevingFormData>({
    grunnlagsperioder: yup
        .array<GrunnlagsperiodeFormData>(
            yup
                .object<GrunnlagsperiodeFormData>({
                    måned: yup.object<Måned>().required(),
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
