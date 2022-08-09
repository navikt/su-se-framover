import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import React from 'react';
import { useForm } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import VilkårsResultatRadioGroup from '~src/components/vilkårsResultatRadioGroup/VilkårsresultatRadioGroup';
import { lagreInstitusjonsoppholdVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import * as DateUtils from '~src/utils/date/dateUtils';

import { FormWrapper } from '../../søknadsbehandling/FormWrapper';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import GjeldendeInstitusjonsopphold from './GjeldendeInstitusjonsopphold';
import messages from './institusjonsopphold-nb';
import styles from './institusjonsopphold.module.less';
import {
    institusjonsoppholdFormSchema,
    InstitusjonsoppholdVilkårFormData,
    nyVurderingsperiodeInstitusjonsopphold,
} from './institusjonsoppholdUtils';

const Institusjonsopphold = (props: RevurderingStegProps) => {
    const [status, lagre] = useAsyncActionCreator(lagreInstitusjonsoppholdVilkår);
    const { formatMessage } = useI18n({ messages });

    const vurderinger = props.revurdering.grunnlagsdataOgVilkårsvurderinger.fastOpphold?.vurderinger ?? [
        { periode: props.revurdering.periode, resultat: null },
    ];

    const form = useForm<InstitusjonsoppholdVilkårFormData>({
        resolver: yupResolver(institusjonsoppholdFormSchema),
        defaultValues: {
            institusjonsopphold: vurderinger.map((vurdering) => ({
                resultat: vurdering.resultat,
                periode: {
                    fraOgMed: parseIsoDateOnly(vurdering.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurdering.periode.tilOgMed),
                },
            })),
        },
    });

    const lagreFastOpphold = (values: InstitusjonsoppholdVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                vurderinger: values.institusjonsopphold.map((v) => ({
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
                        save={lagreFastOpphold}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <>
                            <MultiPeriodeVelger
                                name="institusjonsopphold"
                                className={styles.multiPeriodeVelger}
                                controller={form.control}
                                appendNyPeriode={nyVurderingsperiodeInstitusjonsopphold}
                                periodeConfig={{
                                    minFraOgMed: revurderingsperiode.fraOgMed,
                                    maxTilOgMed: revurderingsperiode.tilOgMed,
                                }}
                                getChild={(nameAndIdx: string) => (
                                    <VilkårsResultatRadioGroup
                                        name={`${nameAndIdx}.resultat`}
                                        legend={formatMessage('institusjonsopphold.vilkår')}
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
                    <GjeldendeInstitusjonsopphold
                        gjeldendeInstitusjonsopphold={props.grunnlagsdataOgVilkårsvurderinger.institusjonsopphold}
                    />
                ),
            }}
        </ToKolonner>
    );
};

export default Institusjonsopphold;