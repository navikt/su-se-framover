import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Select, Ingress } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { Sak } from '~types/Sak';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './klage-nb';
import styles from './klage.module.less';

interface Props {
    sak: Sak;
}

interface FormData {
    vedtakId: string;
    innenforFristen: boolean;
    klagesDetPåKonkreteElementerIVedtaket: boolean;
    signert: boolean;
    begrunnelse: string;
}

const schema = yup.object<FormData>({
    vedtakId: yup.string(),
    innenforFristen: yup.boolean(),
    klagesDetPåKonkreteElementerIVedtaket: yup.boolean(),
    signert: yup.boolean(),
    begrunnelse: yup.string(),
});

const VurderFormkrav = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.klageVurderFormkrav>();
    const { formatMessage } = useI18n({ messages });
    const klage = props.sak.klager.find((klage) => klage.id === urlParams.klageId);

    if (!klage) {
        return <div>404</div>;
    }

    const { handleSubmit, register, formState, control } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vedtakId: '',
            innenforFristen: undefined,
            klagesDetPåKonkreteElementerIVedtaket: undefined,
            signert: undefined,
            begrunnelse: '',
        },
    });

    return (
        <form className={styles.formkrav} onSubmit={handleSubmit((values) => console.log(values))}>
            <Ingress>Vurder formkrav</Ingress>
            <Controller
                control={control}
                name="vedtakId"
                render={({ field, fieldState }) => (
                    <Select label="Velg vedtak" error={fieldState.error?.message} {...field}>
                        <option>{formatMessage('formkrav.vedtak.option.default')}</option>
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
            <Button>Submit</Button>
        </form>
    );
};

export default VurderFormkrav;
