import { Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import {
    BeslutningEtterForhåndsvarsling,
    InformasjonsRevurdering,
    ResultatEtterForhåndsvarselRequest,
} from '~src/types/Revurdering';
import { erRevurderingOpphørPgaManglendeDokumentasjon } from '~src/utils/revurdering/revurderingUtils';

import { UNDERSCORE_REGEX } from '../revurderingOppsummeringsPageUtils';

export enum BeslutningEtterForhåndsvarslingFormData {
    FortsettSammeOpplysninger = 'FORTSETT_MED_SAMME_OPPLYSNINGER',
    FortsettMedAndreOpplysninger = 'FORTSETT_MED_ANDRE_OPPLYSNINGER',
    AvsluttUtenEndringer = 'AVSLUTT_UTEN_ENDRINGER',
}

export interface ResultatEtterForhåndsvarselFormData {
    beslutningEtterForhåndsvarsel: Nullable<BeslutningEtterForhåndsvarslingFormData>;
    tekstTilVedtaksbrev: Nullable<string>;
    begrunnelse: Nullable<string>;
}

export const resultatEtterForhåndsvarselFormDataTilRequest = (
    sakId: string,
    revurderingId: string,
    v: ResultatEtterForhåndsvarselFormData
): ResultatEtterForhåndsvarselRequest => {
    return {
        sakId,
        revurderingId,
        valg: BeslutningEtterForhåndsvarslingFormDataTilBeslutningEtterForhåndsvarsel(v.beslutningEtterForhåndsvarsel!),
        begrunnelse: v.begrunnelse!,
        fritekstTilBrev: v.tekstTilVedtaksbrev,
    };
};

const BeslutningEtterForhåndsvarslingFormDataTilBeslutningEtterForhåndsvarsel = (
    b: BeslutningEtterForhåndsvarslingFormData
): BeslutningEtterForhåndsvarsling => {
    switch (b) {
        case BeslutningEtterForhåndsvarslingFormData.FortsettMedAndreOpplysninger:
            return BeslutningEtterForhåndsvarsling.FortsettMedAndreOpplysninger;
        case BeslutningEtterForhåndsvarslingFormData.FortsettSammeOpplysninger:
            return BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger;
        case BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer:
            throw new Error(
                'Prøve å sende beslutning om at revurderingen skal avsluttes. Revurderingen skal avsluttes gjennom saksoversikten'
            );
    }
};

export const resultatEtterForhpndsvarselSchema = (r: InformasjonsRevurdering) =>
    yup.object<ResultatEtterForhåndsvarselFormData>({
        beslutningEtterForhåndsvarsel: yup
            .mixed()
            .oneOf(Object.values(BeslutningEtterForhåndsvarslingFormData), 'Feltet må fylles ut')
            .required(),
        tekstTilVedtaksbrev: yup
            .string()
            .defined()
            .when('beslutningEtterForhåndsvarsel', {
                is: BeslutningEtterForhåndsvarsling.FortsettSammeOpplysninger,
                then: yup
                    .string()
                    .matches(
                        UNDERSCORE_REGEX,
                        erRevurderingOpphørPgaManglendeDokumentasjon(r)
                            ? 'Du må erstatte _____ med informasjon'
                            : 'Du må erstatte _____ med tall'
                    )
                    .required(),
            }),
        begrunnelse: yup
            .string()
            .test('Begrunnelse må fylles ut', 'Begrunnelse må fylles ut', function (value) {
                if (
                    this.parent.beslutningEtterForhåndsvarsel ===
                    BeslutningEtterForhåndsvarslingFormData.AvsluttUtenEndringer
                ) {
                    return true;
                } else return value !== null;
            })
            .nullable()
            .defined(),
    });
