import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';

export interface AvsluttRevurderingFormData {
    fritekst: Nullable<string>;
    brevvalgForForhåndsvarsel: Nullable<Brevvalg>;
    begrunnelse: Nullable<string>;
}

export enum Brevvalg {
    SKAL_SENDE_BREV_MED_FRITEKST = 'SKAL_SENDE_BREV_MED_FRITEKST',
    SKAL_IKKE_SENDE_BREV = 'SKAL_IKKE_SENDE_BREV',
}

export const avsluttRevurderingSchema = (erRevurderingForhåndsvarslet: boolean) =>
    yup.object<AvsluttRevurderingFormData>({
        fritekst: yup
            .string()
            .nullable()
            .defined()
            .test('Fritekst må fylles ut', 'Fritekst for brev må fylles ut', function (value) {
                if (this.parent.brevvalgForForhåndsvarsel === Brevvalg.SKAL_SENDE_BREV_MED_FRITEKST) {
                    return value !== null;
                }
                return true;
            }),
        brevvalgForForhåndsvarsel: yup
            .string<Brevvalg>()
            .test('Ugyldig valg for brev', 'Må velge om brev skal sendes eller ikke', function (value) {
                if (erRevurderingForhåndsvarslet) {
                    return value !== null;
                }
                return true;
            }),

        begrunnelse: yup.string().required().typeError('Feltet må fylles ut'),
    });
