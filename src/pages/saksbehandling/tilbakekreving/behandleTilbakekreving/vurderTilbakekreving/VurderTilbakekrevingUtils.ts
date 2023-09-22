import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { TilbakekrevingsValg } from '~src/types/ManuellTilbakekrevingsbehandling';
import { Periode } from '~src/types/Periode';

export interface VurderTilbakekrevingFormData {
    grunnlagsperioder: GrunnlagsperiodeFormData[];
}

interface GrunnlagsperiodeFormData {
    periode: Periode<string>;
    skalTilbakekreves: Nullable<TilbakekrevingsValg>;
}

export const vurderTilbakekrevingSchema = yup.object<VurderTilbakekrevingFormData>({
    grunnlagsperioder: yup
        .array<GrunnlagsperiodeFormData>(
            yup
                .object<GrunnlagsperiodeFormData>({
                    periode: yup
                        .object<Periode<string>>({
                            fraOgMed: yup.string().required().defined(),
                            tilOgMed: yup.string().required().defined(),
                        })
                        .required(),
                    skalTilbakekreves: yup
                        .mixed<TilbakekrevingsValg>()
                        .oneOf([TilbakekrevingsValg.SKAL_IKKE_TILBAKEKREVES, TilbakekrevingsValg.SKAL_TILBAKEKREVES])
                        .required(),
                })
                .required(),
        )
        .required(),
});
