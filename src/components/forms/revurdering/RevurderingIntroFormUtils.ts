import { UseFormReturn } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks';
import { Nullable } from '~src/lib/types';
import yup, { validerPeriodeTomEtterFom } from '~src/lib/validering';
import { NullablePeriode, Periode } from '~src/types/Periode';
import {
    OpprettetRevurderingGrunn,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettRevurderingRequest,
    OppdaterRevurderingRequest,
    OmgjøringsGrunn,
} from '~src/types/Revurdering';

export interface RevurderingIntroFormData {
    periode: NullablePeriode;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    omgjøringGrunn: Nullable<OmgjøringsGrunn>;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: Nullable<string>;
}

export const revurderingIntroFormDataTilOpprettRequest = (args: {
    sakId: string;
    values: RevurderingIntroFormData;
}): OpprettRevurderingRequest => {
    return {
        sakId: args.sakId,
        begrunnelse: args.values.begrunnelse!,
        informasjonSomRevurderes: args.values.informasjonSomRevurderes,
        periode: { fraOgMed: args.values.periode.fraOgMed!, tilOgMed: args.values.periode.tilOgMed! },
        årsak: args.values.årsak!,
    };
};

export const revurderingIntroFormDataTilOppdaterRequest = (args: {
    sakId: string;
    revurderingId: string;
    values: RevurderingIntroFormData;
}): OppdaterRevurderingRequest => {
    return {
        sakId: args.sakId,
        revurderingId: args.revurderingId,
        begrunnelse: args.values.begrunnelse!,
        informasjonSomRevurderes: args.values.informasjonSomRevurderes,
        periode: { fraOgMed: args.values.periode.fraOgMed!, tilOgMed: args.values.periode.tilOgMed! },
        årsak: args.values.årsak!,
    };
};

export const revurderingIntroFormSchema = yup.object<RevurderingIntroFormData>({
    periode: validerPeriodeTomEtterFom,
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().required(),
    omgjøringGrunn: yup.mixed<OmgjøringsGrunn>().nullable().required(),
    begrunnelse: yup.string().nullable().required(),
    informasjonSomRevurderes: yup
        .array<InformasjonSomRevurderes>(
            yup.mixed<InformasjonSomRevurderes>().oneOf(Object.values(InformasjonSomRevurderes)),
        )
        .min(1, 'Du må velge minst en ting å revurdere')
        .required(),
});

export interface RevurderingIntroFormProps {
    form: UseFormReturn<RevurderingIntroFormData>;
    minOgMaxPeriode: Periode;
    neste: {
        savingState: ApiResult<InformasjonsRevurdering>;
        onClick: (values: RevurderingIntroFormData, onSuccess: () => void) => void;
    };
    tilbake: {
        url?: string;
    };
    lagreOgfortsettSenere?: {
        chainNesteKall?: boolean;
        loading?: boolean;
        url: string;
        onClick?: (values: RevurderingIntroFormData, onSuccess: () => void) => void;
    };
}
