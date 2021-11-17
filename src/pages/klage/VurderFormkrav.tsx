import { yupResolver } from '@hookform/resolvers/yup';
import { TextField, Button, Select } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';

import { BooleanRadioGroup } from '~components/formElements/FormElements';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import yup from '~lib/validering';
import { Sak } from '~types/Sak';

import messages from './klage-nb';

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
        <form onSubmit={handleSubmit((values) => console.log(values))}>
            <Controller
                control={control}
                name="vedtakId"
                render={({ field, fieldState }) => (
                    <Select label="Velg vedtak" error={fieldState.error?.message} {...field}>
                        <option>Inget relevant vedtak</option>
                        {props.sak.vedtak.map((v) => (
                            <option key={v.id}>{`${formatMessage(v.type)} ${v.opprettet}`}</option>
                        ))}
                    </Select>
                )}
            />

            <Controller
                control={control}
                name="innenforFristen"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup legend="Innenfor fristen" error={fieldState.error?.message} {...field} />
                )}
            />

            <Controller
                control={control}
                name="klagesDetPåKonkreteElementerIVedtaket"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup
                        legend="klages det på konkrete ting"
                        error={fieldState.error?.message}
                        {...field}
                    />
                )}
            />

            <Controller
                control={control}
                name="signert"
                render={({ field, fieldState }) => (
                    <BooleanRadioGroup legend="signert?" error={fieldState.error?.message} {...field} />
                )}
            />

            <TextField {...register('begrunnelse')} error={formState.errors.begrunnelse?.message} label="Begrunnelse" />
            <Button>Submit</Button>
        </form>
    );
};

export default VurderFormkrav;
