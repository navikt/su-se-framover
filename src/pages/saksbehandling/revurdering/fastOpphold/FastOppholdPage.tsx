import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import { Behandlingstype, RevurderingOgFeilmeldinger } from '~src/api/GrunnlagOgVilkårApi';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { lagreFastOppholdVilkår } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import {
    fastOppholdFormSchema,
    FastOppholdVilkårFormData,
    nyVurderingsperiodeFastOpphold,
} from '~src/pages/saksbehandling/revurdering/fastOpphold/fastOppholdUtils';
import { GjeldendeFastOppholdVilkår } from '~src/pages/saksbehandling/revurdering/fastOpphold/GjeldendeFastOppholdVilkår';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import * as DateUtils from '~src/utils/date/dateUtils';

import messages from './fastOpphold-nb';
import styles from './fastOppholdPage.module.less';

export function FastOppholdPage(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagreFastOppholdVilkår);
    const { formatMessage } = useI18n({ messages });

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.vurderinger ?? [
        { periode: props.revurdering.periode, resultat: null },
    ];

    const form = useForm<FastOppholdVilkårFormData>({
        resolver: yupResolver(fastOppholdFormSchema),
        defaultValues: {
            fastOpphold: vurderinger.map((vurdering) => ({
                resultat: vurdering.resultat,
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
            })),
        },
    });

    const lagreFastOpphold = (values: FastOppholdVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                behandlingId: props.revurdering.id,
                vurderinger: values.fastOpphold.map((v) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
                    },
                    vurdering: v.resultat!,
                })),
                behandlingstype: Behandlingstype.Revurdering,
            },
            (res) => {
                if ((res as RevurderingOgFeilmeldinger).feilmeldinger.length === 0) {
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
                        save={lagreFastOpphold}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <>
                            <MultiPeriodeVelger
                                name="fastOpphold"
                                className={styles.multiPeriodeVelger}
                                controller={form.control}
                                appendNyPeriode={nyVurderingsperiodeFastOpphold}
                                periodeConfig={{
                                    minFraOgMed: revurderingsperiode.fraOgMed,
                                    maxTilOgMed: revurderingsperiode.tilOgMed,
                                }}
                                getChild={(nameAndIdx: string) => (
                                    <VilkårsResultatRadioGroup
                                        name={`${nameAndIdx}.resultat`}
                                        legend={formatMessage('fastOpphold.vilkår')}
                                        controller={form.control}
                                    />
                                )}
                            />
                            {RemoteData.isSuccess(status) && (
                                <UtfallSomIkkeStøttes
                                    feilmeldinger={(status.value as RevurderingOgFeilmeldinger).feilmeldinger}
                                />
                            )}
                        </>
                    </FormWrapper>
                ),
                right: (
                    <GjeldendeFastOppholdVilkår
                        gjeldendeFastOppholdVilkår={props.grunnlagsdataOgVilkårsvurderinger.fastOpphold}
                    />
                ),
            }}
        </ToKolonner>
    );
}

export default FastOppholdPage;
