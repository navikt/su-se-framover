import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Select, Loader, Textarea } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as B from 'fp-ts/lib/boolean';
import * as S from 'fp-ts/string';
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
import { eqNullable, Nullable } from '~lib/types';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Klage, KlageStatus } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { formatDateTime } from '~utils/date/dateUtils';

import messages from './klage-nb';
import styles from './klage.module.less';

const eqFormData = struct<FormData>({
    vedtakId: eqNullable(S.Eq),
    innenforFristen: eqNullable(B.Eq),
    klagesDetPåKonkreteElementerIVedtaket: eqNullable(B.Eq),
    signert: eqNullable(B.Eq),
    begrunnelse: eqNullable(S.Eq),
});

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

/*const schema = yup.object<FormData>({
    vedtakId: yup.string().typeError('Feltet må fylles ut').required(),
    innenforFristen: yup.boolean().typeError('Feltet må fylles ut').required(),
    klagesDetPåKonkreteElementerIVedtaket: yup.boolean().typeError('Feltet må fylles ut').required(),
    signert: yup.boolean().typeError('Feltet må fylles ut').required(),
    begrunnelse: yup.string().defined(),
}); */

const VurderFormkrav = (props: Props) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });
    const [lagreStatus, lagre] = useAsyncActionCreator(klageActions.vurderFormkrav);
    const [bekreftStatus, bekreft] = useAsyncActionCreator(klageActions.bekreftFormkrav);

    const initialValues = {
        vedtakId: props.klage.vedtakId,
        innenforFristen: props.klage.innenforFristen,
        klagesDetPåKonkreteElementerIVedtaket: props.klage.klagesDetPåKonkreteElementerIVedtaket,
        signert: props.klage.erUnderskrevet,
        begrunnelse: props.klage.begrunnelse,
    };

    const {
        handleSubmit,
        control,
        reset,
        formState: { isDirty, isSubmitSuccessful },
    } = useForm<FormData>({
        //resolver: yupResolver(schema),
        defaultValues: initialValues,
    });

    const handleLagreFormkrav = (values: FormData) => {
        if (eqFormData.equals(values, initialValues)) {
            return;
        }

        lagre(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                vedtakId: values.vedtakId,
                innenforFristen: values.innenforFristen,
                klagesDetPåKonkreteElementerIVedtaket: values.klagesDetPåKonkreteElementerIVedtaket,
                erUnderskrevet: values.signert,
                begrunnelse: values.begrunnelse,
            },
            (klage) => {
                //vi resetter formet, slik at tilstandssjekken til isDirty, og isSubmitSuccessful har den nye dataen
                reset({
                    vedtakId: klage.vedtakId,
                    innenforFristen: klage.innenforFristen,
                    klagesDetPåKonkreteElementerIVedtaket: klage.klagesDetPåKonkreteElementerIVedtaket,
                    signert: klage.erUnderskrevet,
                    begrunnelse: klage.begrunnelse,
                });
            }
        );
    };

    const handleBekreftOgFortsettClick = () => {
        if (props.klage.status === KlageStatus.VILKÅRSVURDERT_BEKREFTET) {
            history.push(
                Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.klage.id,
                    steg: KlageSteg.Vurdering,
                })
            );
            return;
        }
        bekreft(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
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
    };

    const iGyldigTilstandForÅBekrefteOgFortsette = () => {
        return (
            (props.klage.status !== KlageStatus.VILKÅRSVURDERT_UTFYLT &&
                props.klage.status !== KlageStatus.VILKÅRSVURDERT_BEKREFTET) ||
            (isDirty && !isSubmitSuccessful)
        );
    };

    return (
        <ToKolonner tittel={formatMessage('formkrav.tittel')}>
            {{
                left: (
                    <form className={styles.form} onSubmit={handleSubmit(handleLagreFormkrav)}>
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
                                {formatMessage('formkrav.button.lagre')}
                                {RemoteData.isPending(lagreStatus) && <Loader />}
                            </Button>
                            <Button
                                type="button"
                                disabled={iGyldigTilstandForÅBekrefteOgFortsette()}
                                onClick={() => handleBekreftOgFortsettClick()}
                            >
                                {formatMessage('formkrav.button.bekreftOgFortsett')}
                                {RemoteData.isPending(bekreftStatus) && <Loader />}
                            </Button>
                        </div>
                        {RemoteData.isFailure(lagreStatus) && <ApiErrorAlert error={lagreStatus.error} />}
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

export default VurderFormkrav;
