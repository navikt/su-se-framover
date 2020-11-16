import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import { FormikErrors, useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import { Input, Textarea, Checkbox, RadioGruppe, Radio } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element } from 'nav-frontend-typografi';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { ErrorCode } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { Personkort } from '~components/Personkort';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { eqEktefelle, eqFormue } from '~features/behandling/behandlingUtils';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup, { validatePositiveNumber } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FormueStatus, Formue, FormueVerdier } from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';
import { FormueInput, ShowSum } from './FormueComponents';
import {
    getInitialVerdier,
    getFormue,
    kalkulerFormue,
    kalkulerFormueFraSøknad,
    delerBoligMedToString,
    getVerdier,
} from './utils';

type FormData = Formue & {
    borSøkerMedEktefelle: Nullable<boolean>;
    ektefellesFnr: Nullable<string>;
};

const VerdierSchema: yup.ObjectSchema<FormueVerdier | undefined> = yup.object<FormueVerdier>({
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
    borSøkerMedEktefelle: yup.boolean().required().typeError('Feltet må fylles ut'),
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
    const [eps, setEps] = useState<Nullable<personApi.Person>>();
    const [personOppslagFeil, setPersonOppslagFeil] = useState<{ statusCode: number } | null>(null);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const behandlingsInfo = props.behandling.behandlingsinformasjon;
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
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
            ektefellesVerdier: values.borSøkerMedEktefelle ? values.ektefellesVerdier : null,
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
                        navn: eps ? eps.navn : null,
                        kjønn: eps ? eps.kjønn : null,
                        adressebeskyttelse: eps ? eps.adressebeskyttelse : null,
                        skjermet: eps ? eps.skjermet : null,
                    },
                },
            })
        );
    };

    // TODO ai: implementera detta i backend
    const G = 101351;

    const formik = useFormik<FormData>({
        initialValues: getFormue(behandlingsInfo, søknadInnhold),
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

    const søkersFormue = useMemo(() => {
        return kalkulerFormue(formik.values.verdier);
    }, [formik.values.verdier]);

    const ektefellesFormue = useMemo(() => {
        return kalkulerFormue(formik.values.ektefellesVerdier);
    }, [formik.values.ektefellesVerdier]);

    const totalFormueFraSøknad = useMemo(() => {
        const søkersFormueFraSøknad = kalkulerFormueFraSøknad(søknadInnhold.formue);

        if (søknadInnhold.ektefelle) {
            return søkersFormueFraSøknad + kalkulerFormueFraSøknad(søknadInnhold.ektefelle.formue);
        }

        return søkersFormueFraSøknad;
    }, [søknadInnhold.formue]);

    const totalFormue = søkersFormue + (formik.values.borSøkerMedEktefelle ? ektefellesFormue : 0);

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
    const [inputToShow, setInputToShow] = useState<'søker' | 'ektefelle' | null>(
        formik.values.borSøkerMedEktefelle ? null : 'søker'
    );

    const vilkårErOppfylt = totalFormue < 0.5 * G;

    const keyNavnForFormue: Array<keyof FormueVerdier> = [
        'verdiIkkePrimærbolig',
        'verdiKjøretøy',
        'innskudd',
        'verdipapir',
        'pengerSkyldt',
        'kontanter',
        'depositumskonto',
    ];

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
                                    onChange={() => {
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEktefelle: true,
                                            ektefellesFnr: null,
                                        });

                                        setInputToShow(null);
                                    }}
                                />
                                <Radio
                                    label="Nei"
                                    name="borSøkerMedEktefelle"
                                    checked={formik.values.borSøkerMedEktefelle === false}
                                    onChange={() => {
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEktefelle: false,
                                            ektefellesFnr: null,
                                            ektefellesVerdier: søknadInnhold.ektefelle
                                                ? getVerdier(
                                                      formik.values.ektefellesVerdier,
                                                      søknadInnhold.ektefelle?.formue
                                                  )
                                                : getInitialVerdier(),
                                        });

                                        setInputToShow('søker');
                                    }}
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

                        <div className={styles.formueInputContainer}>
                            <div className={inputToShow === 'søker' ? styles.aktivFormueBlokk : undefined}>
                                {inputToShow === 'søker' &&
                                    keyNavnForFormue.map((keyNavn) => (
                                        <FormueInput
                                            key={keyNavn}
                                            tittel={intl.formatMessage({ id: `input.label.${keyNavn}` })}
                                            className={styles.formueInput}
                                            inputName={`verdier.${keyNavn}`}
                                            onChange={formik.handleChange}
                                            defaultValue={formik.values.verdier?.[keyNavn] ?? 0}
                                            feil={
                                                (formik.errors.verdier as FormikErrors<FormueVerdier> | undefined)?.[
                                                    keyNavn
                                                ]
                                            }
                                        />
                                    ))}

                                {formik.values.borSøkerMedEktefelle && (
                                    <>
                                        <ShowSum
                                            tittel={intl.formatMessage({ id: 'display.søkersFormue' })}
                                            sum={søkersFormue}
                                        />

                                        {inputToShow !== 'søker' ? (
                                            <Knapp
                                                className={styles.toggleInput}
                                                onClick={() => setInputToShow('søker')}
                                                htmlType="button"
                                            >
                                                {intl.formatMessage({ id: 'knapp.endreSøkersFormue' })}
                                            </Knapp>
                                        ) : (
                                            <Knapp
                                                htmlType="button"
                                                className={styles.toggleInput}
                                                onClick={() => setInputToShow(null)}
                                            >
                                                Lagre
                                            </Knapp>
                                        )}
                                    </>
                                )}
                            </div>

                            {formik.values.borSøkerMedEktefelle && (
                                <div className={inputToShow === 'ektefelle' ? styles.aktivFormueBlokk : undefined}>
                                    {inputToShow === 'ektefelle' &&
                                        keyNavnForFormue.map((keyNavn) => (
                                            <FormueInput
                                                key={keyNavn}
                                                tittel={intl.formatMessage({ id: `input.label.${keyNavn}` })}
                                                className={styles.formueInput}
                                                inputName={`ektefellesVerdier.${keyNavn}`}
                                                onChange={formik.handleChange}
                                                defaultValue={formik.values.ektefellesVerdier?.[keyNavn] ?? 0}
                                                feil={
                                                    (formik.errors.ektefellesVerdier as
                                                        | FormikErrors<FormueVerdier>
                                                        | undefined)?.[keyNavn]
                                                }
                                            />
                                        ))}
                                    <ShowSum
                                        tittel={intl.formatMessage({ id: 'display.ektefellesFormue' })}
                                        sum={ektefellesFormue}
                                    />

                                    {inputToShow !== 'ektefelle' ? (
                                        <Knapp
                                            className={styles.toggleInput}
                                            onClick={() => setInputToShow('ektefelle')}
                                            htmlType="button"
                                        >
                                            {intl.formatMessage({ id: 'knapp.endreEktefellesFormue' })}
                                        </Knapp>
                                    ) : (
                                        <Knapp
                                            className={styles.toggleInput}
                                            htmlType="button"
                                            onClick={() => setInputToShow(null)}
                                        >
                                            Lagre
                                        </Knapp>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className={styles.totalFormueContainer}>
                            <ShowSum tittel={intl.formatMessage({ id: 'display.totalt' })} sum={totalFormue} />

                            <div className={styles.status}>
                                <VilkårvurderingStatusIcon
                                    status={vilkårErOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                                />
                                <div className={styles.statusInformasjon}>
                                    <p>
                                        {vilkårErOppfylt
                                            ? intl.formatMessage({ id: 'display.vilkårOppfylt' })
                                            : intl.formatMessage({ id: 'display.vilkårIkkeOppfylt' })}
                                    </p>
                                    <p>
                                        {vilkårErOppfylt
                                            ? intl.formatMessage({ id: 'display.vilkårOppfyltGrunn' })
                                            : intl.formatMessage({ id: 'display.vilkårIkkeOppfyltGrunn' })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.begrunnelse}
                        />

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
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.delerBoligMed' }),
                                    verdi: delerBoligMedToString(søknadInnhold.boforhold.delerBoligMed),
                                },
                                {
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.ektefelleTitle' }),
                                    verdi: søknadInnhold.ektefelle ? (
                                        <>
                                            <p>
                                                {`${intl.formatMessage({
                                                    id: 'display.fraSøknad.ektefellesFnr',
                                                })}: ${
                                                    søknadInnhold.boforhold.ektefellePartnerSamboer
                                                        ? søknadInnhold.boforhold.ektefellePartnerSamboer?.type ===
                                                          'MedFnr'
                                                            ? søknadInnhold.boforhold.ektefellePartnerSamboer.fnr
                                                            : søknadInnhold.boforhold.ektefellePartnerSamboer
                                                                  .fødselsdato
                                                        : '-'
                                                }`}
                                            </p>
                                            {søknadInnhold.boforhold.ektefellePartnerSamboer?.type === 'UtenFnr' && (
                                                <p>{`${intl.formatMessage({
                                                    id: 'display.fraSøknad.ektefellesNavn',
                                                })}: ${søknadInnhold.boforhold.ektefellePartnerSamboer.navn}`}</p>
                                            )}
                                            <p>
                                                {`${intl.formatMessage({
                                                    id: 'display.fraSøknad.ektefellesFormue',
                                                })}: ${kalkulerFormueFraSøknad(
                                                    søknadInnhold.ektefelle.formue
                                                ).toString()}`}
                                            </p>
                                        </>
                                    ) : (
                                        'Ingen ektefelle'
                                    ),
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
                                    tittel: intl.formatMessage({ id: 'display.fraSøknad.kontanter' }),
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
                        <p className={styles.formueFraSøknad}>
                            {intl.formatMessage({ id: 'display.fraSøknad.totalt' })}: {totalFormueFraSøknad}
                        </p>
                    </div>
                ),
            }}
        </Vurdering>
    );
};

export default Formue;
