import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import * as RemoteData from '~node_modules/@devexperts/remote-data-ts';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { lagreFlyktningVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import {
    FlyktningVilkårFormData,
    flyktningFormSchema,
    nyVurderingsperiodeFlyktning,
} from '~src/pages/saksbehandling/revurdering/flyktning/flyktningUtils';
import GjeldendeFlyktningVilkår from '~src/pages/saksbehandling/revurdering/flyktning/GjeldendeFlyktningVilkår';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';

import messages from './flyktning-nb';

export function FlyktningPage(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagreFlyktningVilkår);
    const { formatMessage } = useI18n({ messages });

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
                    <FormWrapper
                        form={form}
                        save={lagreFlyktning}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <>
                            <MultiPeriodeVelger
                                name="flyktning"
                                controller={form.control}
                                appendNyPeriode={nyVurderingsperiodeFlyktning}
                                periodeConfig={{
                                    minFraOgMed: revurderingsperiode.fraOgMed,
                                    maxTilOgMed: revurderingsperiode.tilOgMed,
                                }}
                                getChild={(nameAndIdx: string) => (
                                    <VilkårsResultatRadioGroup
                                        name={`${nameAndIdx}.resultat`}
                                        legend={formatMessage('flyktning.vilkår')}
                                        controller={form.control}
                                    />
                                )}
                            />
                            {RemoteData.isSuccess(status) && (
                                <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                            )}
                        </>
                    </FormWrapper>
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
