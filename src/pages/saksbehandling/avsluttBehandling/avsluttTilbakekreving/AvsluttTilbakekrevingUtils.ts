import yup from '~src/lib/validering';

export interface AvsluttTilbakekrevingFormData {
    skalSendeBrev: BrevvalgAvsluttTilbakekreving;
    fritekst: string;
    begrunnelse: string;
}

export enum BrevvalgAvsluttTilbakekreving {
    SKAL_SENDE_BREV_MED_FRITEKST = 'SKAL_SENDE_BREV_MED_FRITEKST',
    SKAL_IKKE_SENDE_BREV = 'SKAL_IKKE_SENDE_BREV',
}

export const avsluttTilbakekrevingSchema = () =>
    yup.object<AvsluttTilbakekrevingFormData>({
        skalSendeBrev: yup.string<BrevvalgAvsluttTilbakekreving>().required(),
        fritekst: yup
            .string()
            .defined()
            .test('Fritekst må fylles ut', 'Fritekst for brev må fylles ut', function (value) {
                if (this.parent.skalSendeBrev === BrevvalgAvsluttTilbakekreving.SKAL_SENDE_BREV_MED_FRITEKST) {
                    return !!(value && value.length > 0);
                }
                return true;
            }),
        begrunnelse: yup.string().required(),
    });
