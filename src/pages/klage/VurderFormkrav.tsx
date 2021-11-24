import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './klage-nb';
import styles from './klage.module.less';

interface Props {
    sakId: string;
    vedtaker: Vedtak[];
    klage: Klage;
}

interface FormData {
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<boolean>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    signert: Nullable<boolean>;
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
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });
    const [vilkårsvurderingStatus, vilkårsvurder] = useAsyncActionCreator(klageActions.vurderFormkrav);

    const { handleSubmit, control } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            vedtakId: props.klage.vedtakId,
            innenforFristen: props.klage.innenforFristen,
            klagesDetPåKonkreteElementerIVedtaket: props.klage.klagesDetPåKonkreteElementerIVedtaket,
            signert: props.klage.erUnderskrevet,
            begrunnelse: props.klage.begrunnelse,
        },
    });

    return (
        <ToKolonner tittel={formatMessage('formkrav.tittel')}>
            {{
                left: (
                    <form
                        className={styles.form}
                        onSubmit={handleSubmit((values) => {
                            vilkårsvurder(
                                {
                                    sakId: props.sakId,
                                    klageId: props.klage.id,
                                    //valdiering sikrer at feltet ikke er null
                                    /* eslint-disable @typescript-eslint/no-non-null-assertion */
                                    vedtakId: values.vedtakId!,
                                    innenforFristen: values.innenforFristen!,
                                    klagesDetPåKonkreteElementerIVedtaket:
                                        values.klagesDetPåKonkreteElementerIVedtaket!,
                                    erUnderskrevet: values.signert!,
                                    /* eslint-enable @typescript-eslint/no-non-null-assertion */
                                    begrunnelse: values.begrunnelse,
                                },
                                () => {
                                    history.push(
                                        Routes.klage.createURL({
                                            sakId: props.sakId,
                                            klageId: props.klage.id,
                                            steg: KlageSteg.Vurdering,
                                        })
                                    );
                                }
                            );
                        })}
                    >
                        <Controller
                            control={control}
                            name="vedtakId"
                            render={({ field, fieldState }) => (
                                <Select
                                    label="Velg vedtak"
                                    error={fieldState.error?.message}
                                    {...field}
                                    value={field.value ?? ''}
                                >
                                    <option value={''}>{formatMessage('formkrav.vedtak.option.default')}</option>
                                    {props.vedtaker.map((v) => (
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

                        <Controller
                            control={control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    {...field}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    label={formatMessage('formkrav.begrunnelse.label')}
                                />
                            )}
                        />

                        <div className={styles.buttons}>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                            >
                                {formatMessage('formkrav.button.tilbake')}
                            </LinkAsButton>
                            <Button>
                                {formatMessage('formkrav.button.submit')}
                                {RemoteData.isPending(vilkårsvurderingStatus) && <Loader />}
                            </Button>
                        </div>
                        {RemoteData.isFailure(vilkårsvurderingStatus) && (
                            <ApiErrorAlert error={vilkårsvurderingStatus.error} />
                        )}
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

export default VurderFormkrav;
