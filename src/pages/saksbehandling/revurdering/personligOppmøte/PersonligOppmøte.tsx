import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Radio, RadioGroup } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagrePersonligOppmøteVilkår } from '~src/features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import RevurderingsperiodeHeader from '~src/pages/saksbehandling/revurdering/revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '~src/pages/saksbehandling/revurdering/utfallSomIkkeStøttes/UtfallSomIkkeStøttes';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { PersonligOppmøteÅrsak } from '~src/types/grunnlagsdataOgVilkårsvurderinger/personligOppmøte/PersonligOppmøte';
import { RevurderingStegProps } from '~src/types/Revurdering';
import { parseIsoDateOnly } from '~src/utils/date/dateUtils';
import * as DateUtils from '~src/utils/date/dateUtils';

import { GjeldendePersonligOppmøte } from './GjeldendePersonligOppmøte';
import messages from './personligOppmøte-nb';
import styles from './personligOppmøte.module.less';
import {
    PersonligOppmøteVilkårFormData,
    personligOppmøteFormSchema,
    nyVurderingsperiodePersonligOppmøte,
    toPersonligOppmøteÅrsakInnsending,
} from './personligOppmøteUtils';

export function PersonligOppmøte(props: RevurderingStegProps) {
    const [status, lagre] = useAsyncActionCreator(lagrePersonligOppmøteVilkår);
    const { formatMessage } = useI18n({ messages });

    const vurderingsperioder = props.revurdering.grunnlagsdataOgVilkårsvurderinger.personligOppmøte?.vurderinger ?? [
        { periode: props.revurdering.periode, vurdering: null },
    ];

    const form = useForm<PersonligOppmøteVilkårFormData>({
        resolver: yupResolver(personligOppmøteFormSchema),
        defaultValues: {
            personligOppmøte: vurderingsperioder.map((vurderingsperiode) => ({
                periode: {
                    fraOgMed: parseIsoDateOnly(vurderingsperiode.periode.fraOgMed),
                    tilOgMed: parseIsoDateOnly(vurderingsperiode.periode.tilOgMed),
                },
                møttPersonlig: vurderingsperiode.vurdering === PersonligOppmøteÅrsak.MøttPersonlig,
                årsakForManglendePersonligOppmøte: vurderingsperiode.vurdering,
            })),
        },
    });

    const lagrePersonligOppmøte = (values: PersonligOppmøteVilkårFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                vurderinger: values.personligOppmøte.map((v) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(v.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(v.periode.tilOgMed!),
                    },
                    vurdering: toPersonligOppmøteÅrsakInnsending(v.møttPersonlig, v.årsakForManglendePersonligOppmøte)!,
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
                        save={lagrePersonligOppmøte}
                        savingState={status}
                        avsluttUrl={props.avsluttUrl}
                        forrigeUrl={props.forrigeUrl}
                        nesteUrl={props.nesteUrl}
                    >
                        <>
                            <MultiPeriodeVelger
                                name="personligOppmøte"
                                className={styles.multiPeriodeVelger}
                                controller={form.control}
                                appendNyPeriode={nyVurderingsperiodePersonligOppmøte}
                                periodeConfig={{
                                    minFraOgMed: revurderingsperiode.fraOgMed,
                                    maxTilOgMed: revurderingsperiode.tilOgMed,
                                }}
                                getChild={(nameAndIdx) => (
                                    <>
                                        <Controller
                                            control={form.control}
                                            name={`${nameAndIdx}.møttPersonlig`}
                                            render={({ field, fieldState }) => (
                                                <RadioGroup
                                                    className={styles.vurderingRadiogroup}
                                                    {...field}
                                                    legend={formatMessage('personligOppmøte.vilkår')}
                                                    error={fieldState.error?.message}
                                                >
                                                    <Radio value={true}>{formatMessage('radio.label.ja')}</Radio>
                                                    <Radio value={false}>{formatMessage('radio.label.nei')}</Radio>
                                                </RadioGroup>
                                            )}
                                        />

                                        {form.watch(`${nameAndIdx}.møttPersonlig`) === false && (
                                            <Controller
                                                control={form.control}
                                                name={`${nameAndIdx}.årsakForManglendePersonligOppmøte`}
                                                render={({ field, fieldState }) => (
                                                    <RadioGroup
                                                        {...field}
                                                        legend={formatMessage(
                                                            'personligOppmøte.ikkeMøttPersonlig.vilkår'
                                                        )}
                                                        error={fieldState.error?.message}
                                                    >
                                                        {Object.values(PersonligOppmøteÅrsak)
                                                            .filter(
                                                                (årsak) =>
                                                                    årsak !== PersonligOppmøteÅrsak.MøttPersonlig &&
                                                                    årsak !== PersonligOppmøteÅrsak.Uavklart
                                                            )
                                                            .map((årsak) => (
                                                                <Radio key={årsak} value={årsak}>
                                                                    {formatMessage(årsak)}
                                                                </Radio>
                                                            ))}
                                                    </RadioGroup>
                                                )}
                                            />
                                        )}
                                    </>
                                )}
                            />
                            {RemoteData.isSuccess(status) && (
                                <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                            )}
                        </>
                    </FormWrapper>
                ),
                right: (
                    <GjeldendePersonligOppmøte
                        gjeldendePersonligOppmøte={props.grunnlagsdataOgVilkårsvurderinger.personligOppmøte}
                    />
                ),
            }}
        </ToKolonner>
    );
}
