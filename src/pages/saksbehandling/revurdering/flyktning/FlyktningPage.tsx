import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import ToKolonner from '~src/components/toKolonner/ToKolonner';
import FlyktningForm from '~src/components/vilkårForms/flyktning/FlyktningForm';
import { FlyktningVilkårFormData, flyktningFormSchema } from '~src/components/vilkårForms/flyktning/FlyktningFormUtils';
import { lagreFlyktningVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import GjeldendeFlyktningVilkår from '~src/pages/saksbehandling/revurdering/flyktning/GjeldendeFlyktningVilkår';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';

export function FlyktningPage(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagreFlyktningVilkår);

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.flyktning?.vurderinger ?? [
        { periode: props.revurdering.periode, resultat: null },
    ];

    const form = useForm<FlyktningVilkårFormData>({
        resolver: yupResolver(flyktningFormSchema),
        defaultValues: {
            flyktning: vurderinger.map((vurdering) => ({
                resultat: vurdering.resultat,
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
            })),
        },
    });

    const lagreFlyktning = (values: FlyktningVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                vurderinger: values.flyktning.map((v) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
                    },
                    vurdering: v.resultat!,
                })),
            },
            (res) => {
                if (res.feilmeldinger.length === 0) {
                    onSuccess();
                }
            }
        );
    const revurderingsperiode = {
        fraOgMed: new Date(props.revurdering.periode.fraOgMed),
        tilOgMed: new Date(props.revurdering.periode.tilOgMed),
    };

    return (
        <ToKolonner tittel={<RevurderingsperiodeHeader periode={props.revurdering.periode} />}>
            {{
                left: (
                    <FlyktningForm
                        form={form}
                        minOgMaxPeriode={revurderingsperiode}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                        avsluttUrl={props.avsluttUrl}
                        onFormSubmit={lagreFlyktning}
                        savingState={status}
                        søknadsbehandlingEllerRevurdering={'Revurdering'}
                        onTilbakeClickOverride={props.onTilbakeClickOverride}
                    />
                ),
                right: (
                    <GjeldendeFlyktningVilkår
                        gjeldendeFlyktingVilkår={props.grunnlagsdataOgVilkårsvurderinger.flyktning}
                    />
                ),
            }}
        </ToKolonner>
    );
}
