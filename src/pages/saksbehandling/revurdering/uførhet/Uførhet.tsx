import { yupResolver } from '@hookform/resolvers/yup';
import * as React from 'react';
import { useForm } from 'react-hook-form';

import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { UførhetForm } from '~src/components/vilkårForms/uførhet/UførhetForm';
import { FormData, vurderingsperiodeTilFormData } from '~src/components/vilkårForms/uførhet/UførhetFormUtils';
import { uførhetSchema } from '~src/components/vilkårForms/uførhet/validation';
import * as revurderingActions from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { GjeldendeGrunnlagsdata } from '~src/pages/saksbehandling/revurdering/uførhet/GjeldendeGrunnlagsdata';
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
        resolver: yupResolver(uførhetSchema(erGregulering(props.revurdering.årsak))),
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
                        fraOgMed: DateUtils.toIsoDateOnlyString(g.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(g.periode.tilOgMed!),
                        /* eslint-enable @typescript-eslint/no-non-null-assertion */
                    },
                    forventetInntekt: g.oppfylt ? Number.parseInt(g.forventetInntekt, 10) : null,
                    uføregrad: g.oppfylt ? Number.parseInt(g.uføregrad, 10) : null,
                    resultat: g.oppfylt ?? UføreResultat.HarUføresakTilBehandling,
                })),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <UførhetForm
                        onFormSubmit={handleSave}
                        form={form}
                        savingState={lagreUføregrunnlagStatus}
                        minDate={DateUtils.parseNonNullableIsoDateOnly(props.revurdering.periode.fraOgMed)}
                        maxDate={DateUtils.parseNonNullableIsoDateOnly(props.revurdering.periode.tilOgMed)}
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
