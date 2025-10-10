import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Select, Loader, RadioGroup, Radio, Alert, ReadMore, Textarea, Heading } from '@navikt/ds-react';
import { struct } from 'fp-ts/Eq';
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
import { eqBooleanMedBegrunnelse, eqNullable, eqSvarMedBegrunnelse, Nullable } from '~src/lib/types';
import yup from '~src/lib/validering';
import { KlageSteg, Svarord, Klage } from '~src/types/Klage';
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
    innenforFristen: eqNullable(eqSvarMedBegrunnelse),
    klagesDetPåKonkreteElementerIVedtaket: eqNullable(eqBooleanMedBegrunnelse),
    erUnderskrevet: eqNullable(eqSvarMedBegrunnelse),
    fremsattRettsligKlageinteresse: eqNullable(eqSvarMedBegrunnelse),
});

interface Props {
    sakId: string;
    vedtak: Vedtak[];
    klage: Klage;
}

export type SvarMedBegrunnelse = {
    svar: Svarord;
    begrunnelse: Nullable<string>;
};

export type BooleanMedBegrunnelse = {
    svar: boolean;
    begrunnelse: Nullable<string>;
};

interface FormData {
    vedtakId: Nullable<string>;
    innenforFristen: Nullable<SvarMedBegrunnelse>;
    klagesDetPåKonkreteElementerIVedtaket: Nullable<BooleanMedBegrunnelse>;
    erUnderskrevet: Nullable<SvarMedBegrunnelse>;
    fremsattRettsligKlageinteresse: Nullable<SvarMedBegrunnelse>;
}

function isValidSvarord(value: string | null | undefined): value is Svarord {
    return typeof value === 'string' && Object.values(Svarord).includes(value as Svarord);
}

const schema = yup.object<FormData>({
    vedtakId: yup.string().defined().required(),
    innenforFristen: yup
        .object<SvarMedBegrunnelse>()
        .defined()
        .when('svar', {
            is: (svar: string | null | undefined) => !isValidSvarord(svar),
            then: yup.object({
                svar: yup
                    .string()
                    .defined()
                    .required('Svar må fylles ut')
                    .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
                begrunnelse: yup.string().nullable().notRequired(),
            }),
            otherwise: yup.object().nullable(),
        }),
    klagesDetPåKonkreteElementerIVedtaket: yup
        .object<BooleanMedBegrunnelse>()
        .defined()
        .when('svar', {
            is: (svar: boolean | null | undefined) => !svar,
            then: yup.object({
                svar: yup.boolean().defined().required('Svar må fylles ut'),
                begrunnelse: yup.string().nullable().notRequired(),
            }),
            otherwise: yup.object().nullable(),
        }),
    erUnderskrevet: yup
        .object<SvarMedBegrunnelse>()
        .defined()
        .when('svar', {
            is: (svar: string | null | undefined) => !isValidSvarord(svar),
            then: yup.object({
                svar: yup
                    .string()
                    .defined()
                    .required('Svar må fylles ut')
                    .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
                begrunnelse: yup.string().nullable().notRequired(),
            }),
            otherwise: yup.object().nullable(),
        }),
    fremsattRettsligKlageinteresse: yup
        .object<SvarMedBegrunnelse>()
        .defined()
        .when('svar', {
            is: (svar: string | null | undefined) => !isValidSvarord(svar),
            then: yup.object({
                svar: yup
                    .string()
                    .defined()
                    .required('Svar må fylles ut')
                    .oneOf(Object.values(Svarord), 'Feltet må være "Ja", "Nei, men skal til vurdering", eller "Nei"'),
                begrunnelse: yup.string().nullable().notRequired(),
            }),
            otherwise: yup.object().nullable(),
        }),
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
        <ToKolonner tittel={formatMessage('formkrav-klagefrist.tittel')}>
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
                        <Heading level="2" size="medium" spacing>
                            {formatMessage('klagefrist.tittel')}
                        </Heading>
                        <Controller
                            control={control}
                            name="innenforFristen.svar"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.innenforFrist.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    <ReadMore header={formatMessage('formkrav.readmore.label')}>
                                        {formatMessage('formkrav.innenforFrist.info')}
                                    </ReadMore>
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name="innenforFristen.begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    {...field}
                                    label={formatMessage('begrunnelse.label')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    description={formatMessage('begrunnelse.description')}
                                />
                            )}
                        />

                        <Heading level="2" size="medium" spacing>
                            {formatMessage('formkrav.tittel')}
                        </Heading>

                        <Controller
                            control={control}
                            name="fremsattRettsligKlageinteresse.svar"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.fremsattrettslig.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    <ReadMore header={formatMessage('formkrav.readmore.label')}>
                                        {formatMessage('formkrav.fremsattrettslig.info')}
                                    </ReadMore>
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name="fremsattRettsligKlageinteresse.begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    {...field}
                                    label={formatMessage('begrunnelse.label')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    description={formatMessage('begrunnelse.description')}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="klagesDetPåKonkreteElementerIVedtaket.svar"
                            render={({ field, fieldState }) => (
                                <BooleanRadioGroup
                                    legend={formatMessage('formkrav.klagesPåKonkreteElementer.label')}
                                    error={fieldState.error?.message}
                                    {...field}
                                >
                                    <ReadMore header={formatMessage('formkrav.readmore.label')}>
                                        {formatMessage('formkrav.klagesPåKonkreteElementer.info')}
                                    </ReadMore>
                                </BooleanRadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name="klagesDetPåKonkreteElementerIVedtaket.begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    {...field}
                                    label={formatMessage('begrunnelse.label')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    description={formatMessage('begrunnelse.description')}
                                />
                            )}
                        />

                        <Controller
                            control={control}
                            name="erUnderskrevet.svar"
                            render={({ field, fieldState }) => (
                                <RadioGroup
                                    {...field}
                                    legend={formatMessage('formkrav.signert.label')}
                                    error={fieldState.error?.message}
                                    value={field.value ?? ''}
                                >
                                    <ReadMore header={formatMessage('formkrav.readmore.label')}>
                                        {formatMessage('formkrav.signert.info')}
                                    </ReadMore>
                                    {fyllInRadioGruppe()}
                                </RadioGroup>
                            )}
                        />
                        <Controller
                            control={control}
                            name="erUnderskrevet.begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    {...field}
                                    label={formatMessage('begrunnelse.label')}
                                    value={field.value ?? ''}
                                    error={fieldState.error?.message}
                                    description={formatMessage('begrunnelse.description')}
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
