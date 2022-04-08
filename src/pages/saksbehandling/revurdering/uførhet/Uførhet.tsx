import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { GjeldendeGrunnlagsdata } from '~src/pages/saksbehandling/revurdering/uførhet/GjeldendeGrunnlagsdata';
import { FormData } from '~src/pages/saksbehandling/steg/uføre/types';
import { vurderingsperiodeTilFormData } from '~src/pages/saksbehandling/steg/uføre/UføreperiodeForm';
import { UførhetForm } from '~src/pages/saksbehandling/steg/uføre/UførhetForm';
import { schema } from '~src/pages/saksbehandling/steg/uføre/validation';
import { UføreResultat } from '~src/types/grunnlagsdataOgVilkårsvurderinger/uføre/Uførevilkår';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { erGregulering } from '~src/utils/revurdering/revurderingUtils';

import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';

const Uførhet = (props: RevurderingStegProps) => {
    const form = useForm<FormData>({
        defaultValues: {
            grunnlag:
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.uføre?.vurderinger.map((u) =>
                    vurderingsperiodeTilFormData(u)
                ) ?? [],
        },
        resolver: yupResolver(schema(erGregulering(props.revurdering.årsak))),
    });

    const [lagreUføregrunnlagStatus, lagreUføregrunnlag] = useAsyncActionCreator(revurderingActions.lagreUføregrunnlag);

    const handleSave = (values: FormData, onSuccess: () => void) =>
        lagreUføregrunnlag(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                vurderinger: values.grunnlag.map((g) => ({
                    periode: {
                        /* eslint-disable @typescript-eslint/no-non-null-assertion */
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    begrunnelse: g.begrunnelse,
                    resultat: g.oppfylt ?? UføreResultat.HarUføresakTilBehandling,
                })),
            },
            onSuccess
        );

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <UførhetForm
                        onFormSubmit={handleSave}
                        form={form}
                        savingState={lagreUføregrunnlagStatus}
                        minDate={DateUtils.parseIsoDateOnly(props.revurdering.periode.fraOgMed)}
                        maxDate={DateUtils.parseIsoDateOnly(props.revurdering.periode.tilOgMed)}
                        erSaksbehandling={false}
                        {...props}
                    />
                ),
                right: <GjeldendeGrunnlagsdata vilkårsvurderinger={props.grunnlagsdataOgVilkårsvurderinger} />,
            }}
        </ToKolonner>
    );
};

export default Uførhet;
