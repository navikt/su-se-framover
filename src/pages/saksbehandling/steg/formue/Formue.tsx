import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import { FormikErrors, useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Input, Textarea, Checkbox, RadioGruppe, Radio } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element } from 'nav-frontend-typografi';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { Personkort } from '~components/Personkort';
import { eqEktefelle, eqFormue } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { validatePositiveNumber } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FormueStatus, Formue, Verdier } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';
import { setInitialValues, kalkulerFormue, kalkulerFormueFraSøknad } from './utils';

const FormueInput = (props: {
    className: string;
    tittel: string;
    inputName: string;
    defaultValue: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    feil: string | undefined;
}) => (
    <>
        <h3> {props.tittel} </h3>
        <Input
            className={props.className}
            name={props.inputName}
            type="number"
            feil={props.feil}
            defaultValue={props.defaultValue}
            onChange={props.onChange}
        />
    </>
);

type FormData = Formue & {
    borSøkerMedEktefelle: Nullable<boolean>;
    ektefellesFnr: Nullable<string>;
};

const VerdierSchema: yup.ObjectSchema<Verdier | undefined> = yup.object<Verdier>({
    verdiIkkePrimærbolig: validatePositiveNumber,
    verdiKjøretøy: validatePositiveNumber,
    innskudd: validatePositiveNumber,
    verdipapir: validatePositiveNumber,
    pengerSkyldt: validatePositiveNumber,
    kontanter: validatePositiveNumber,
    depositumskonto: validatePositiveNumber,
});

const schema = yup.object<FormData>({
    status: yup.mixed().required().oneOf([FormueStatus.VilkårOppfylt, FormueStatus.MåInnhenteMerInformasjon]),
    verdier: VerdierSchema.required(),
    ektefellesVerdier: VerdierSchema.required(),
    begrunnelse: yup.string().defined(),
    borSøkerMedEktefelle: yup.boolean().required(),
    ektefellesFnr: yup.mixed<string>().when('borSøkerMedEktefelle', {
        is: true,
        then: yup.mixed<string>().test('erGyldigFnr', 'Fnr er ikke gyldig', (fnr) => {
            return fnr && fnrValidator.fnr(fnr).status === 'valid';
        }),
    }),
});

const Formue = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const behandlingsInfo = props.behandling.behandlingsinformasjon;
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [eps, setEps] = useState<Nullable<personApi.Person>>();
    const [personOppslagFeil, setPersonOppslagFeil] = useState<{ statusCode: number } | null>(null);
    const onSave = (values: FormData) => {
        const status =
            values.status === FormueStatus.MåInnhenteMerInformasjon
                ? FormueStatus.MåInnhenteMerInformasjon
                : totalFormue <= 0.5 * G
                ? FormueStatus.VilkårOppfylt
                : FormueStatus.VilkårIkkeOppfylt;

        const formueValues: Formue = {
            status,
            verdier: values.verdier,
            ektefellesVerdier: null,
            begrunnelse: values.begrunnelse,
        };
        const ektefelle = {
            harEktefellePartnerSamboer: values.borSøkerMedEktefelle,
            fnr: values.ektefellesFnr,
        };

        if (
            eqFormue.equals(formueValues, props.behandling.behandlingsinformasjon.formue) &&
            eqEktefelle.equals(ektefelle, props.behandling.behandlingsinformasjon.ektefelle)
        ) {
            history.push(props.nesteUrl);
            return;
        }

        return dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    formue: { ...formueValues },
                    ektefelle: {
                        fnr: values.ektefellesFnr,
                    },
                },
            })
        );
    };

    // TODO ai: implementera detta i backend
    const G = 101351;

    const formik = useFormik<FormData>({
        initialValues: setInitialValues(behandlingsInfo, søknadInnhold),
        async onSubmit() {
            const res = await onSave(formik.values);
            if (!res) return;

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const history = useHistory();

    const totalFormue = useMemo(() => {
        const totalt = kalkulerFormue(formik.values.verdier);
        return isNaN(totalt) ? intl.formatMessage({ id: 'display.totalt.fyllUtAlleFelter' }) : totalt;
    }, [formik.values]);

    const totalFormueFraSøknad = useMemo(() => {
        return kalkulerFormueFraSøknad(søknadInnhold.formue);
    }, [søknadInnhold.formue]);

    useEffect(() => {
        async function fetchPerson(fnr: Nullable<string>) {
            setEps(null);
            setPersonOppslagFeil(null);
            if (!fnr || fnrValidator.fnr(fnr).status === 'invalid') {
                return;
            }

            const res = await personApi.fetchPerson(fnr);
            if (res.status === 'error') {
                setPersonOppslagFeil({ statusCode: res.error.statusCode });
                return;
            }
            if (res.status === 'ok') {
                const ektefelle = res.data;

                formik.setValues({
                    ...formik.values,
                    ektefellesFnr: ektefelle.fnr,
                });
                setEps(ektefelle);
            }
        }

        fetchPerson(formik.values.ektefellesFnr);
    }, [formik.values.ektefellesFnr]);

    return (
        <Vurdering tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div className={styles.ektefellePartnerSamboer}>
                            <Element>Bor søker med en ektefelle eller samboer?</Element>
                            <RadioGruppe feil={formik.errors.borSøkerMedEktefelle}>
                                <Radio
                                    label="Ja"
                                    name="borSøkerMedEktefelle"
                                    checked={Boolean(formik.values.borSøkerMedEktefelle)}
                                    onChange={() =>
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEktefelle: true,
                                            ektefellesFnr: null,
                                        })
                                    }
                                />
                                <Radio
                                    label="Nei"
                                    name="borSøkerMedEktefelle"
                                    checked={formik.values.borSøkerMedEktefelle === false}
                                    onChange={() =>
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEktefelle: false,
                                            ektefellesFnr: null,
                                        })
                                    }
                                />
                            </RadioGruppe>
                            {formik.values.borSøkerMedEktefelle && (
                                <>
                                    <Element>Ektefelle/samboers fødselsnummer</Element>
                                    <div className={styles.fnrInput}>
                                        <Input
                                            name="ektefellesFnr"
                                            defaultValue={formik.values.ektefellesFnr ?? ''}
                                            onChange={formik.handleChange}
                                            bredde="S"
                                            feil={formik.errors.ektefellesFnr}
                                        />
                                        <div className={styles.result}>
                                            {eps && <Personkort person={eps} />}
                                            {personOppslagFeil && (
                                                <AlertStripe type="feil">
                                                    {personOppslagFeil.statusCode === ErrorCode.Unauthorized
                                                        ? intl.formatMessage({ id: 'feilmelding.ikkeTilgang' })
                                                        : personOppslagFeil.statusCode === ErrorCode.NotFound
                                                        ? intl.formatMessage({ id: 'feilmelding.ikkeFunnet' })
                                                        : intl.formatMessage({ id: 'feilmelding.ukjent' })}
                                                </AlertStripe>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdiIkkePrimærBolig' })}
                            className={styles.formueInput}
                            inputName="verdier.verdiIkkePrimærbolig"
                            onChange={formik.handleChange}
                            defaultValue={formik.values.verdier?.verdiIkkePrimærbolig ?? 0}
                            feil={(formik.errors.verdier as FormikErrors<Verdier> | undefined)?.verdiIkkePrimærbolig}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdiKjøretøy' })}
                            className={styles.formueInput}
                            inputName="verdier.verdiKjøretøy"
                            onChange={formik.handleChange}
                            defaultValue={formik.values.verdier?.verdiKjøretøy ?? 0}
                            feil={(formik.errors.verdier as FormikErrors<Verdier> | undefined)?.verdiKjøretøy}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.inskuddPåKonto' })}
                            className={styles.formueInput}
                            inputName="verdier.innskudd"
                            onChange={formik.handleChange}
                            defaultValue={formik.values.verdier?.innskudd ?? 0}
                            feil={(formik.errors.verdier as FormikErrors<Verdier> | undefined)?.innskudd}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.verdipapir' })}
                            className={styles.formueInput}
                            inputName="verdier.verdipapir"
                            onChange={formik.handleChange}
                            defaultValue={formik.values.verdier?.verdipapir ?? 0}
                            feil={(formik.errors.verdier as FormikErrors<Verdier>)?.verdipapir}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.skylderNoenSøkerPenger' })}
                            className={styles.formueInput}
                            inputName="verdier.pengerSkyldt"
                            defaultValue={formik.values.verdier?.pengerSkyldt ?? 0}
                            onChange={formik.handleChange}
                            feil={(formik.errors.verdier as FormikErrors<Verdier>)?.pengerSkyldt}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.kontanterOver1000' })}
                            className={styles.formueInput}
                            inputName="verdier.kontanter"
                            defaultValue={formik.values.verdier?.kontanter ?? 0}
                            onChange={formik.handleChange}
                            feil={(formik.errors.verdier as FormikErrors<Verdier>)?.kontanter}
                        />
                        <FormueInput
                            tittel={intl.formatMessage({ id: 'input.label.depositumskonto' })}
                            className={styles.formueInput}
                            inputName="verdier.depositumskonto"
                            onChange={formik.handleChange}
                            defaultValue={formik.values.verdier?.depositumskonto ?? 0}
                            feil={(formik.errors.verdier as FormikErrors<Verdier>)?.depositumskonto}
                        />
                        <div className={styles.totalFormueContainer}>
                            <p className={styles.totalFormue}>
                                {intl.formatMessage({ id: 'display.totalt' })} {totalFormue}
                            </p>

                            {totalFormue > 0.5 * G ? (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>
                                        {intl.formatMessage({ id: 'display.vilkårIkkeOppfylt' })}
                                    </p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            ) : (
                                <div>
                                    <p className={styles.vilkårOppfyltText}>
                                        {intl.formatMessage({ id: 'display.vilkårOppfylt' })}
                                    </p>
                                    <hr></hr>
                                    <hr></hr>
                                </div>
                            )}
                        </div>
                        <Checkbox
                            label={intl.formatMessage({ id: 'checkbox.henteMerInfo' })}
                            name="status"
                            className={styles.henteMerInfoCheckbox}
                            checked={formik.values.status === FormueStatus.MåInnhenteMerInformasjon}
                            onChange={() => {
                                formik.setValues({
                                    ...formik.values,
                                    status:
                                        formik.values.status === FormueStatus.VilkårOppfylt
                                            ? FormueStatus.MåInnhenteMerInformasjon
                                            : FormueStatus.VilkårOppfylt,
                                });
                            }}
                        />
                        <Textarea
                            label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.begrunnelse}
                        />
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => onSave(formik.values)}
                        />
                    </form>
                ),
                right: (
                    <div>
                        <Faktablokk
                            tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                            faktaBlokkerClassName={styles.formueFaktaBlokk}
                            fakta={[
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.ektefellesFnr' }),
                                    verdi: søknadInnhold.boforhold.ektefellePartnerSamboer
                                        ? søknadInnhold.boforhold.ektefellePartnerSamboer?.type === 'MedFnr'
                                            ? søknadInnhold.boforhold.ektefellePartnerSamboer.fnr
                                            : søknadInnhold.boforhold.ektefellePartnerSamboer.fødselsdato
                                        : '-',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.ektefellesNavn' }),
                                    verdi:
                                        søknadInnhold.boforhold.ektefellePartnerSamboer?.type === 'UtenFnr'
                                            ? søknadInnhold.boforhold.ektefellePartnerSamboer.navn
                                            : '-',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåBolig' }),
                                    verdi: søknadInnhold.formue.verdiPåBolig?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåEiendom' }),
                                    verdi: søknadInnhold.formue.verdiPåEiendom?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdiPåKjøretøy' }),
                                    verdi:
                                        søknadInnhold.formue.kjøretøy
                                            ?.reduce((acc, kjøretøy) => acc + kjøretøy.verdiPåKjøretøy, 0)
                                            .toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.innskuddsbeløp' }),
                                    verdi: søknadInnhold.formue.innskuddsBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.verdipapirbeløp' }),
                                    verdi: søknadInnhold.formue.verdipapirBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.kontanterOver1000' }),
                                    verdi: søknadInnhold.formue.kontanterBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.skylderNoenSøkerPengerBeløp' }),
                                    verdi: søknadInnhold.formue.skylderNoenMegPengerBeløp?.toString() ?? '0',
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.depositumsBeløp' }),
                                    verdi: søknadInnhold.formue.depositumsBeløp?.toString() ?? '0',
                                },
                            ]}
                        />
                        <p className={styles.formueFraSøknad}>Totalt: {totalFormueFraSøknad}</p>
                    </div>
                ),
            }}
        </Vurdering>
    );
};

export default Formue;
