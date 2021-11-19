import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Select, Ingress, Loader } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import * as klageApi from '~api/klageApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { Klage } from '~types/Klage';
import { Sak } from '~types/Sak';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './klage-nb';
import styles from './klage.module.less';

interface Props {
    sak: Sak;
    klage: Klage;
}

interface FormData {
    vedtakId: string;
    innenforFristen: boolean;
    klagesDetPåKonkreteElementerIVedtaket: boolean;
    signert: boolean;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    vedtakId: yup.string().typeError('Feltet må fylles ut').required(),
    innenforFristen: yup.boolean().typeError('Feltet må fylles ut').required(),
    klagesDetPåKonkreteElementerIVedtaket: yup.boolean().typeError('Feltet må fylles ut').required(),
    signert: yup.boolean().typeError('Feltet må fylles ut').required(),
    begrunnelse: yup.string().defined(),
});

const VurderFormkrav = (props: Props) => {
    const { formatMessage } = useI18n({ messages });
    const [vilkårsvurderingStatus, vilkårsvurder] = useApiCall(klageApi.vilkårsvurder);

    const { handleSubmit, register, formState, control } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vedtakId: props.klage.vedtakId ?? '',
            innenforFristen: props.klage.innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket: props.klage.klagesDetPåKonkreteElementerIVedtaket,
            signert: props.klage.erUnderskrevet,
            begrunnelse: props.klage.begrunnelse,
        },
    });

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit((values) => {
                console.log(values);

                vilkårsvurder({
                    sakId: props.sak.id,
                    klageId: props.klage.id,
                    vedtakId: values.vedtakId,
                    innenforFristen: values.innenforFristen,
                    klagesDetPåKonkreteElementerIVedtaket: values.klagesDetPåKonkreteElementerIVedtaket,
                    erUnderskrevet: values.signert,
                    begrunnelse: values.begrunnelse,
                });
            })}
        >
            <Ingress>{formatMessage('formkrav.tittel')}</Ingress>
            <Controller
                control={control}
                name="vedtakId"
                render={({ field, fieldState }) => (
                    <Select label="Velg vedtak" error={fieldState.error?.message} {...field}>
                        <option value={''}>{formatMessage('formkrav.vedtak.option.default')}</option>
                        {props.sak.vedtak.map((v) => (
                            <option key={v.id} value={v.id}>{`${formatMessage(v.type)} ${formatDateTime(
                                v.opprettet
                            )}`}</option>
                        ))}
                    </Select>
                )}
            />

            <Controller
                control={control}
                name="innenforFristen"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend={formatMessage('formkrav.innenforFrist.label')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="klagesDetPåKonkreteElementerIVedtaket"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="signert"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend={formatMessage('formkrav.signert.label')}
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />

            <TextField {...register('begrunnelse')} error={formState.errors.begrunnelse?.message} label="Begrunnelse" />
            <div className={styles.buttons}>
                <LinkAsButton variant="secondary" href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })}>
                    {formatMessage('formkrav.button.tilbake')}
                </LinkAsButton>
                <Button>
                    {formatMessage('formkrav.button.submit')}
                    {RemoteData.isPending(vilkårsvurderingStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(vilkårsvurderingStatus) && <ApiErrorAlert error={vilkårsvurderingStatus.error} />}
        </form>
    );
};

export default VurderFormkrav;
