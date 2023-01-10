import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { OpprettetRevurderingGrunn } from '~src/types/Revurdering';

export interface StansFormData {
    årsak: Nullable<OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING>;
    stansDato: Nullable<Date>;
    begrunnelse: Nullable<string>;
}

export interface GjenopptaFormData {
    årsak: Nullable<OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING>;
    begrunnelse: Nullable<string>;
}

export type StansGjenopptaFormData = StansFormData | GjenopptaFormData;

export const isStans = (o: StansGjenopptaFormData): o is StansFormData => 'stansDato' in o;

export const stansGjenopptaSchema = yup.object<StansGjenopptaFormData>({
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - den forstår ikke at valdiering per nå er helt OK
    årsak: yup.mixed().when('$formType', (formType, schema) => {
        if (formType === 'stans') {
            return yup.mixed<OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING>().required();
        }
        if (formType === 'gjenoppta') {
            return yup.mixed<OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING>().required();
        }

        return schema;
    }),
    //eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - den forstår ikke at valdiering per nå er helt OK
    stansDato: yup.date().when('$formType', (formType, schema) => {
        if (formType === 'stans') {
            return yup.date().required().typeError('Må velge dato');
        }
        return schema;
    }),
    begrunnelse: yup.string().required('Må fylles ut').nullable(),
});
