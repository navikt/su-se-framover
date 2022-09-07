import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Heading } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { FnrInput } from '~src/components/FnrInput/FnrInput';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import MultiPeriodeVelger from '~src/components/multiPeriodeVelger/MultiPeriodeVelger';
import OppsummeringAvBosituasjongrunnlag from '~src/components/oppsummeringAvVilkårOgGrunnlag/OppsummeringAvBosituasjon';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import { lagreBosituasjonsgrunnlag } from '~src/features/grunnlagsdataOgVilkårsvurderinger/GrunnlagOgVilkårActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import { FormWrapper } from '~src/pages/saksbehandling/søknadsbehandling/FormWrapper';
import { RevurderingStegProps } from '~src/types/Revurdering';
import * as DateUtils from '~src/utils/date/dateUtils';

import sharedMessages from '../revurdering-nb';
import RevurderingsperiodeHeader from '../revurderingsperiodeheader/RevurderingsperiodeHeader';
import UtfallSomIkkeStøttes from '../utfallSomIkkeStøttes/UtfallSomIkkeStøttes';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';
import {
    BosituasjonFormData,
    bosituasjonFormSchema,
    bosituasjonTilFormItemData,
    nyBosituasjon,
} from './bosituasjonPageUtils';

const BosituasjonPage = (props: RevurderingStegProps) => {
    const [status, lagre] = useAsyncActionCreator(lagreBosituasjonsgrunnlag);
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const form = useForm<BosituasjonFormData>({
        defaultValues: {
            bosituasjoner:
                props.revurdering.grunnlagsdataOgVilkårsvurderinger.bosituasjon.map((b) =>
                    bosituasjonTilFormItemData(b)
                ) ?? [],
        },
        resolver: yupResolver(bosituasjonFormSchema),
    });

    const lagreBosituasjon = (data: BosituasjonFormData, onSuccess: () => void) =>
        lagre(
            {
                sakId: props.sakId,
                revurderingId: props.revurdering.id,
                bosituasjoner: data.bosituasjoner.map((b) => ({
                    periode: {
                        fraOgMed: DateUtils.toIsoDateOnlyString(b.periode.fraOgMed!),
                        tilOgMed: DateUtils.toIsoDateOnlyString(b.periode.tilOgMed!),
                    },
                    epsFnr: b.harEPS ? b.epsFnr : null,
                    delerBolig: b.harEPS ? null : b.delerBolig,
                    erEPSUførFlyktning: b.harEPS && b.epsAlder && b.epsAlder < 67 ? b.erEPSUførFlyktning : null,
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
                    <FormWrapper form={form} save={lagreBosituasjon} savingState={status} {...props}>
                        <>
                            <MultiPeriodeVelger
                                name={'bosituasjoner'}
                                controller={form.control}
                                appendNyPeriode={nyBosituasjon}
                                periodeConfig={{
                                    minFraOgMed: new Date(props.revurdering.periode.fraOgMed),
                                    maxTilOgMed: new Date(props.revurdering.periode.tilOgMed),
                                }}
                                getChild={(nameAndIdx) => {
                                    const watch = form.watch(nameAndIdx);
                                    return (
                                        <div className={styles.formItemInputContainer}>
                                            <Controller
                                                control={form.control}
                                                name={`${nameAndIdx}.harEPS`}
                                                render={({ field, fieldState }) => (
                                                    <BooleanRadioGroup
                                                        legend={formatMessage('form.harSøkerEPS')}
                                                        error={fieldState.error?.message}
                                                        {...field}
                                                    />
                                                )}
                                            />
                                            {watch.harEPS && (
                                                <div className={styles.epsFormContainer}>
                                                    <Controller
                                                        control={form.control}
                                                        name={`${nameAndIdx}.epsFnr`}
                                                        render={({ field, fieldState }) => (
                                                            <FnrInput
                                                                label={formatMessage('form.epsFnr')}
                                                                inputId="epsFnr"
                                                                name={`${nameAndIdx}.epsFnr`}
                                                                onFnrChange={field.onChange}
                                                                fnr={field.value ?? ''}
                                                                feil={fieldState.error?.message}
                                                                getHentetPerson={(person) => {
                                                                    form.setValue(`${nameAndIdx}`, {
                                                                        ...watch,
                                                                        epsAlder: person?.alder ?? null,
                                                                    });
                                                                }}
                                                            />
                                                        )}
                                                    />
                                                    {watch.epsAlder && watch.epsAlder < 67 && (
                                                        <Controller
                                                            control={form.control}
                                                            name={`${nameAndIdx}.erEPSUførFlyktning`}
                                                            render={({ field, fieldState }) => (
                                                                <BooleanRadioGroup
                                                                    legend={formatMessage('form.erEPSUførFlyktning')}
                                                                    error={fieldState.error?.message}
                                                                    {...field}
                                                                />
                                                            )}
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            {watch.harEPS === false && (
                                                <Controller
                                                    control={form.control}
                                                    name={`${nameAndIdx}.delerBolig`}
                                                    render={({ field, fieldState }) => (
                                                        <BooleanRadioGroup
                                                            legend={formatMessage('form.delerBolig')}
                                                            error={fieldState.error?.message}
                                                            {...field}
                                                        />
                                                    )}
                                                />
                                            )}
                                        </div>
                                    );
                                }}
                            />
                            {RemoteData.isSuccess(status) && (
                                <UtfallSomIkkeStøttes feilmeldinger={status.value.feilmeldinger} />
                            )}
                        </>
                    </FormWrapper>
                ),
                right: (
                    <>
                        <Heading level="2" size="large" spacing>
                            {formatMessage('eksisterende.vedtakinfo.tittel')}
                        </Heading>
                        <OppsummeringAvBosituasjongrunnlag
                            bosituasjon={props.grunnlagsdataOgVilkårsvurderinger.bosituasjon}
                        />
                    </>
                ),
            }}
        </ToKolonner>
    );
};

export default BosituasjonPage;
