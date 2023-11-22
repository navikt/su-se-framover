import yup from '~src/lib/validering';

export interface AvsluttTilbakekrevingFormData {
    begrunnelse: string;
}

export const avsluttTilbakekrevingSchema = () =>
    yup.object<AvsluttTilbakekrevingFormData>({
        begrunnelse: yup.string().required(),
    });
