import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { TilbakekrevingsVurdering } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Periode } from '~src/types/Periode';

export interface VurderTilbakekrevingFormData {
    grunnlagsperioder: GrunnlagsperiodeFormData[];
}

interface GrunnlagsperiodeFormData {
    måned: Periode<string>;
    vurdering: Nullable<TilbakekrevingsVurdering>;
}

export const vurderTilbakekrevingSchema = yup.object<VurderTilbakekrevingFormData>({
    grunnlagsperioder: yup
        .array<GrunnlagsperiodeFormData>(
            yup
                .object<GrunnlagsperiodeFormData>({
                    måned: yup
                        .object<Periode<string>>({
                            fraOgMed: yup.string().required().defined(),
                            tilOgMed: yup.string().required().defined(),
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
