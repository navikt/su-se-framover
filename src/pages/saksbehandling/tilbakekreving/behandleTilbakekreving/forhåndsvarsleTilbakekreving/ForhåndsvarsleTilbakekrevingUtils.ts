import yup from '~src/lib/validering';

export interface ForhåndsvarsleTilbakekrevingFormData {
    skalForhåndsvarsle: boolean;
    fritekst: string;
}

export const forhåndsvarsleTilbakekrevingFormSchema = yup.object({});
