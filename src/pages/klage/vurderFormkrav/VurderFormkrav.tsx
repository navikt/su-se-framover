import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select, Loader, Textarea, RadioGroup, Radio, Alert } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as B from 'fp-ts/lib/boolean';
import * as S from 'fp-ts/string';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router';
import { Link } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~components/formElements/FormElements';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import ToKolonner from '~components/toKolonner/ToKolonner';
import * as klageActions from '~features/klage/klageActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { eqNullable, Nullable } from '~lib/types';
import yup from '~lib/validering';
import { KlageSteg } from '~pages/saksbehandling/types';
import { Svarord, Klage, KlageInnenforFristen, KlageErUnderskrevet } from '~types/Klage';
import { Vedtak } from '~types/Vedtak';
import { formatDateTime } from '~utils/date/dateUtils';
import { erKlageVilkårsvurdertBekreftetEllerSenere, iGyldigTilstandForÅVilkårsvurdere } from '~utils/klage/klageUtils';

import sharedStyles from '../klage.module.less';

import messages from './vurderFormkrav-nb';
import styles from './vurderFormkrav.module.less';

const eqFormData = struct<FormData>({
    vedtakId: eqNullable(S.Eq),
    innenforFristen: eqNullable(S.Eq),
    klagesDetPåKonkreteElementerIVedtaket: eqNullable(B.Eq),
    erUnderskrevet: eqNullable(S.Eq),
    begrunnelse: eqNullable(S.Eq),
});

interface Props {
    sakId: string;
    vedtaker: Vedtak[];
    klage: Klage;
}

interface FormData {
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    vedtakId: yup.string().defined().required(),
    innenforFristen: yup
        .string()
        .required()
        .defined()
        .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
    klagesDetPåKonkreteElementerIVedtaket: yup.boolean().defined().required(),
    erUnderskrevet: yup
        .string()
        .defined()
        .required()
        .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
    begrunnelse: yup.string().defined().required(),
});

const VurderFormkrav = (props: Props) => {
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });
    const [lagreStatus, lagre] = useAsyncActionCreator(klageActions.vurderFormkrav);
    const [bekreftStatus, bekreft] = useAsyncActionCreator(klageActions.bekreftFormkrav);

    const initialValues: FormData = {
        vedtakId: props.klage.vedtakId,
        innenforFristen: props.klage.innenforFristen,
        klagesDetPåKonkreteElementerIVedtaket: props.klage.klagesDetPåKonkreteElementerIVedtaket,
        erUnderskrevet: props.klage.erUnderskrevet,
        begrunnelse: props.klage.begrunnelse,
    };

    const {
        handleSubmit,
        control,
        watch,
        formState: { isDirty },
    } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: initialValues,
    });

    const handleLagreFormkrav = (values: FormData) => {
        if (eqFormData.equals(values, initialValues)) {
            history.push(
                Routes.saksoversiktValgtSak.createURL({
                    sakId: props.sakId,
                })
            );
            return;
        }

        lagre(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                vedtakId: values.vedtakId,
                innenforFristen: values.innenforFristen,
                klagesDetPåKonkreteElementerIVedtaket: values.klagesDetPåKonkreteElementerIVedtaket,
                erUnderskrevet: values.erUnderskrevet,
                begrunnelse: values.begrunnelse,
            },
            () => {
                history.push(
                    Routes.saksoversiktValgtSak.createURL({
                        sakId: props.sakId,
                    })
                );
            }
        );
    };

    const handleBekreftOgFortsettClick = (values: FormData) => {
        if (erKlageVilkårsvurdertBekreftetEllerSenere(props.klage) && !isDirty) {
            history.push(
                Routes.klage.createURL({
                    sakId: props.sakId,
                    klageId: props.klage.id,
                    steg: KlageSteg.Vurdering,
                })
            );
            return;
        }

        lagre(
            {
                sakId: props.sakId,
                klageId: props.klage.id,
                vedtakId: values.vedtakId,
                innenforFristen: values.innenforFristen,
                klagesDetPåKonkreteElementerIVedtaket: values.klagesDetPåKonkreteElementerIVedtaket,
                erUnderskrevet: values.erUnderskrevet,
                begrunnelse: values.begrunnelse,
            },
            () => {
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
            }
        );
    };

    if (!iGyldigTilstandForÅVilkårsvurdere(props.klage)) {
        return (
            <div className={sharedStyles.feilTilstandContainer}>
                <Alert variant="error">{formatMessage('feil.ikkeRiktigTilstandForÅVilkårsvurdere')}</Alert>
                <Link to={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>
        );
    }

    const fyllInRadioGruppe = () =>
        Object.values(Svarord).map(
            (verdi) =>
                //fjern disabled når vi har støtte for nei
                verdi !== Svarord.NEI && (
                    <Radio value={verdi} key={verdi}>
                        {formatMessage(verdi)}
                    </Radio>
                )
        );

    return (
        <ToKolonner tittel={formatMessage('formkrav.tittel')}>
            {{
                left: (
                    <form className={styles.form} onSubmit={handleSubmit(handleBekreftOgFortsettClick)}>
                        <Controller
                            control={control}
                            name="vedtakId"
                            render={({ field, fieldState }) => (
                                <Select
                                    className={styles.vedtakSelecter}
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
                            name="klagesDetPåKonkreteElementerIVedtaket"
                            render={({ field, fieldState }) => (
                                <BooleanRadioGroup
                                    legend={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                                    error={fieldState.error?.message}
                                    {...field}
                                    hideNei
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="innenforFristen"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.innenforFrist.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
                            )}
                        />

                        <Controller
                            control={control}
                            name="erUnderskrevet"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.signert.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
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
                                    description={formatMessage('formkrav.begrunnelse.description')}
                                />
                            )}
                        />

                        <div className={styles.buttons}>
                            <Button type="button" variant="secondary" onClick={() => handleLagreFormkrav(watch())}>
                                {formatMessage('formkrav.button.lagre')}
                                {RemoteData.isPending(lagreStatus) && <Loader />}
                            </Button>
                            <Button>
                                {formatMessage('formkrav.button.bekreftOgFortsett')}
                                {RemoteData.isPending(bekreftStatus) && <Loader />}
                            </Button>
                            <LinkAsButton
                                variant="secondary"
                                href={Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })}
                            >
                                {formatMessage('formkrav.button.tilbake')}
                            </LinkAsButton>
                        </div>
                        {RemoteData.isFailure(lagreStatus) && <ApiErrorAlert error={lagreStatus.error} />}
                        {RemoteData.isFailure(bekreftStatus) && <ApiErrorAlert error={bekreftStatus.error} />}
                    </form>
                ),
                right: <></>,
            }}
        </ToKolonner>
    );
};

export default VurderFormkrav;
