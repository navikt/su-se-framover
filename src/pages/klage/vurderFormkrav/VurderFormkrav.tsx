import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select, Loader, RadioGroup, Radio, Alert } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
import * as B from 'fp-ts/lib/boolean';
import * as S from 'fp-ts/string';
import { Controller, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import ApiErrorAlert from '~src/components/apiErrorAlert/ApiErrorAlert';
import { BooleanRadioGroup } from '~src/components/formElements/FormElements';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton';
import ToKolonner from '~src/components/toKolonner/ToKolonner';
import * as klageActions from '~src/features/klage/klageActions';
import { useAsyncActionCreator } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';
import * as Routes from '~src/lib/routes';
import { eqNullable, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import {
    KlageSteg,
    Svarord,
    Klage,
    KlageInnenforFristen,
    KlageErUnderskrevet,
    FremsattRettsligKlageinteresse,
} from '~src/types/Klage';
import { Vedtak } from '~src/types/Vedtak';
import { formatDateTime } from '~src/utils/date/dateUtils';
import {
    erKlageAvvist,
    erKlageOpprettet,
    erKlageVilkårsvurdert,
    erKlageVilkårsvurdertAvvist,
    erKlageVilkårsvurdertBekreftetEllerSenere,
    erKlageVurdert,
} from '~src/utils/klage/klageUtils';

import sharedStyles from '../klage.module.less';

import messages from './vurderFormkrav-nb';
import styles from './vurderFormkrav.module.less';

const eqFormData = struct<FormData>({
    vedtakId: eqNullable(S.Eq),
    innenforFristen: eqNullable(S.Eq),
    klagesDetPåKonkreteElementerIVedtaket: eqNullable(B.Eq),
    erUnderskrevet: eqNullable(S.Eq),
    fremsattRettsligKlageinteresse: eqNullable(S.Eq),
});

interface Props {
    sakId: string;
    vedtak: Vedtak[];
    klage: Klage;
}

interface FormData {
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<KlageInnenforFristen>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<boolean>;
    erUnderskrevet: Nullable<KlageErUnderskrevet>;
    fremsattRettsligKlageinteresse: Nullable<FremsattRettsligKlageinteresse>;
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
    fremsattRettsligKlageinteresse: yup
        .string()
        .defined()
        .required()
        .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
});

const VurderFormkrav = (props: Props) => {
    const navigate = useNavigate();
    const { formatMessage } = useI18n({ messages });
    const [lagreStatus, lagre] = useAsyncActionCreator(klageActions.vurderFormkrav);
    const [bekreftStatus, bekreft] = useAsyncActionCreator(klageActions.bekreftFormkrav);

    const initialValues: FormData = {
        vedtakId: props.klage.vedtakId,
        innenforFristen: props.klage.innenforFristen,
        klagesDetPåKonkreteElementerIVedtaket: props.klage.klagesDetPåKonkreteElementerIVedtaket,
        erUnderskrevet: props.klage.erUnderskrevet,
        fremsattRettsligKlageinteresse: props.klage.fremsattRettsligKlageinteresse,
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
            navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
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
                fremsattRettsligKlageinteresse: values.fremsattRettsligKlageinteresse,
            },
            () => {
                navigate(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            },
        );
    };

    const skalNavigeresTilAvvisning = (k: Klage) => {
        return erKlageVilkårsvurdertAvvist(k) || erKlageAvvist(k);
    };

    const navigerTilNesteSide = (klage: Klage) => {
        navigate(
            Routes.klage.createURL({
                sakId: props.sakId,
                klageId: props.klage.id,
                steg: skalNavigeresTilAvvisning(klage) ? KlageSteg.Avvisning : KlageSteg.Vurdering,
            }),
        );
    };

    const handleBekreftOgFortsettClick = (values: FormData) => {
        if (erKlageVilkårsvurdertBekreftetEllerSenere(props.klage) && !isDirty) {
            navigerTilNesteSide(props.klage);
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
                fremsattRettsligKlageinteresse: values.fremsattRettsligKlageinteresse,
            },
            () => {
                bekreft(
                    {
                        sakId: props.sakId,
                        klageId: props.klage.id,
                    },
                    (klage) => {
                        navigerTilNesteSide(klage);
                    },
                );
            },
        );
    };

    const iGyldigTilstandForÅVilkårsvurdere = (k: Klage) =>
        erKlageOpprettet(k) || erKlageVilkårsvurdert(k) || erKlageVurdert(k) || erKlageAvvist(k);

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
        Object.values(Svarord).map((verdi) => (
            <Radio value={verdi} key={verdi}>
                {formatMessage(verdi)}
            </Radio>
        ));

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
                                    {props.vedtak
                                        .filter((v) => v.skalSendeBrev)
                                        .map((v) => (
                                            <option key={v.id} value={v.id}>{`${formatMessage(v.type)} ${formatDateTime(
                                                v.opprettet,
                                            )}`}</option>
                                        ))}
                                </Select>
                            )}
                        />

                        <Controller
                            control={control}
                            name="fremsattRettsligKlageinteresse"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.fremsattrettslig.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
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
