import { getEq } from 'fp-ts/Array';
import { struct } from 'fp-ts/lib/Eq';
import * as S from 'fp-ts/lib/string';
import { UseFormReturn } from 'react-hook-form';

import { ApiResult } from '~src/lib/hooks';
import { Nullable, eqNullable } from '~src/lib/types';
import yup, { validerPeriodeTomEtterFom } from '~src/lib/validering';
import { NullablePeriode, Periode } from '~src/types/Periode';
import {
    OpprettetRevurderingGrunn,
    InformasjonSomRevurderes,
    InformasjonsRevurdering,
    OpprettRevurderingRequest,
    OppdaterRevurderingRequest,
} from '~src/types/Revurdering';
import { eqPeriode } from '~src/utils/periode/periodeUtils';

export interface RevurderingIntroFormData {
    periode: NullablePeriode;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: Nullable<string>;
}

export const eqRevurderingIntroFormData = struct<RevurderingIntroFormData>({
    periode: eqPeriode,
    årsak: eqNullable(S.Eq),
    informasjonSomRevurderes: getEq(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

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
