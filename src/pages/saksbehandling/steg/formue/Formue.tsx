import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import { FormikErrors, useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import { Input, Textarea, Checkbox, RadioGruppe, Radio, Feiloppsummering } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Tekstomrade, { BoldRule, HighlightRule, LinebreakRule } from 'nav-frontend-tekstomrade';
import { Element, Feilmelding, Undertittel } from 'nav-frontend-typografi';
import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { ApiError, ErrorCode } from '~api/apiClient';
import * as personApi from '~api/personApi';
import { Personkort } from '~components/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import { eqEktefelle, eqFormue } from '~features/behandling/behandlingUtils';
import personSlice from '~features/person/person.slice';
import { showName } from '~features/person/personUtils';
import sakSlice, { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { removeSpaces } from '~lib/formatUtils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering, validateNonNegativeNumber } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { FormueStatus, Formue, FormueVerdier } from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import { FormueFaktablokk } from '../faktablokk/faktablokker/FormueFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';
import { FormueInput, ShowSum } from './FormueComponents';
import { getInitialVerdier, getFormue, kalkulerFormue, getVerdier, keyNavnForFormue } from './utils';

type FormData = Formue & {
    borSøkerMedEPS: Nullable<boolean>;
    epsFnr: Nullable<string>;
};

const VerdierSchema: yup.ObjectSchema<FormueVerdier | undefined> = yup.object<FormueVerdier>({
    verdiIkkePrimærbolig: validateNonNegativeNumber,
    verdiEiendommer: validateNonNegativeNumber,
    verdiKjøretøy: validateNonNegativeNumber,
    innskudd: validateNonNegativeNumber,
    verdipapir: validateNonNegativeNumber,
    pengerSkyldt: validateNonNegativeNumber,
    kontanter: validateNonNegativeNumber,
    depositumskonto: validateNonNegativeNumber,
});

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .required()
        .oneOf([FormueStatus.VilkårOppfylt, FormueStatus.MåInnhenteMerInformasjon, FormueStatus.VilkårIkkeOppfylt]),
    verdier: VerdierSchema.required(),
    epsVerdier: VerdierSchema.required(),
    begrunnelse: yup.string().defined(),
    borSøkerMedEPS: yup.boolean().required().typeError('Feltet må fylles ut'),
    epsFnr: yup.mixed<string>().when('borSøkerMedEPS', {
        is: true,
        then: yup.mixed<string>().test('erGyldigFnr', 'Fnr er ikke gyldig', (fnr) => {
            return fnr && fnrValidator.fnr(fnr).status === 'valid';
        }),
    }),
});

const Formue = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);

    const [eps, setEps] = useState<RemoteData.RemoteData<ApiError, personApi.Person>>(RemoteData.initial);

    const [kanEndreAnnenPersonsFormue, setKanEndreAnnenPersonsFormue] = useState<boolean>(true);
    const [åpnerNyFormueBlokkMenViserEnBlokk, setÅpnerNyFormueBlokkMenViserEnBlokk] = useState<boolean>(false);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const behandlingsInfo = props.behandling.behandlingsinformasjon;
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const eksisterendeBosituasjon = props.behandling.behandlingsinformasjon.bosituasjon;

    const handleSave = async (values: FormData, nesteUrl: string) => {
        if (RemoteData.isPending(eps) && values.epsFnr !== null) return;

        const status =
            values.status === FormueStatus.MåInnhenteMerInformasjon
                ? FormueStatus.MåInnhenteMerInformasjon
                : totalFormue <= 0.5 * G
                ? FormueStatus.VilkårOppfylt
                : FormueStatus.VilkårIkkeOppfylt;

        const formueValues: Formue = {
            status,
            verdier: values.verdier,
            borSøkerMedEPS: values.borSøkerMedEPS,
            epsVerdier: values.borSøkerMedEPS ? values.epsVerdier : null,
            begrunnelse: values.begrunnelse,
        };
        const ektefelle = {
            harEktefellePartnerSamboer: values.borSøkerMedEPS,
            fnr: values.epsFnr,
        };

        const erEktefelleUendret = eqEktefelle.equals(ektefelle, props.behandling.behandlingsinformasjon.ektefelle);

        if (eqFormue.equals(formueValues, props.behandling.behandlingsinformasjon.formue) && erEktefelleUendret) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    formue: formueValues,
                    ektefelle: RemoteData.isSuccess(eps)
                        ? {
                              fnr: eps.value.fnr,
                              navn: eps.value.navn,
                              kjønn: eps.value.kjønn,
                              fødselsdato: eps.value.fødselsdato,
                              alder: eps.value.alder,
                              adressebeskyttelse: eps.value.adressebeskyttelse,
                              skjermet: eps.value.skjermet,
                          }
                        : {
                              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                              fnr: values.epsFnr!,
                          },
                    //Det skal kreves ny registerering av sats når EPS endres. Enten ved ny Fnr, eller fjerner/legger til EPS.
                    //Denne sørger for at vi nuller ut sats steget hvis det er gjort en endring, og vi har en eksisterende bosituasjon
                    bosituasjon:
                        !erEktefelleUendret && eksisterendeBosituasjon
                            ? {
                                  ...eksisterendeBosituasjon,
                                  delerBolig: null,
                                  ektemakeEllerSamboerUførFlyktning: null,
                              }
                            : eksisterendeBosituasjon,
                },
            })
        );

        if (!res) return;

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

    // TODO ai: implementera detta i backend
    const G = 101351;

    const formik = useFormik<FormData>({
        initialValues: getFormue(behandlingsInfo, søknadInnhold),
        async onSubmit() {
            handleSave(formik.values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const history = useHistory();

    const søkersFormue = useMemo(() => {
        return kalkulerFormue(formik.values.verdier);
    }, [formik.values.verdier]);

    const ektefellesFormue = useMemo(() => {
        return kalkulerFormue(formik.values.epsVerdier);
    }, [formik.values.epsVerdier]);

    const totalFormue = søkersFormue + (formik.values.borSøkerMedEPS ? ektefellesFormue : 0);

    useEffect(() => {
        async function fetchPerson(fnr: Nullable<string>) {
            if (!fnr || fnrValidator.fnr(fnr).status === 'invalid') {
                return;
            }
            setEps(RemoteData.pending);

            const res = await personApi.fetchPerson(fnr);
            if (res.status === 'error') {
                setEps(RemoteData.failure(res.error));
            } else {
                setEps(RemoteData.success(res.data));
            }
        }

        if (fnrValidator.fnr(formik.values.epsFnr || '').status === 'valid') {
            fetchPerson(formik.values.epsFnr);
        } else {
            setEps(RemoteData.initial);
        }
    }, [formik.values.epsFnr]);

    const handleEpsSkjermingModalContinueClick = async () => {
        await handleSave(formik.values, Routes.home.createURL());
        dispatch(sakSlice.actions.resetSak());
        dispatch(personSlice.actions.resetSøker());
    };

    const [inputToShow, setInputToShow] = useState<'søker' | 'ektefelle' | null>(
        formik.values.borSøkerMedEPS ? null : 'søker'
    );

    const vilkårErOppfylt = totalFormue < 0.5 * G;

    return (
        <ToKolonner tittel={intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div className={styles.ektefellePartnerSamboer}>
                            <Element>{intl.formatMessage({ id: 'input.label.borSøkerMedEktefelle' })}</Element>
                            <RadioGruppe feil={formik.errors.borSøkerMedEPS}>
                                <Radio
                                    label="Ja"
                                    name="borSøkerMedEPS"
                                    checked={Boolean(formik.values.borSøkerMedEPS)}
                                    onChange={() => {
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEPS: true,
                                            epsFnr: null,
                                        });

                                        setInputToShow(null);
                                    }}
                                />
                                <Radio
                                    label="Nei"
                                    name="borSøkerMedEPS"
                                    checked={formik.values.borSøkerMedEPS === false}
                                    onChange={() => {
                                        formik.setValues({
                                            ...formik.values,
                                            borSøkerMedEPS: false,
                                            epsFnr: null,
                                            epsVerdier: søknadInnhold.ektefelle
                                                ? getVerdier(formik.values.epsVerdier, søknadInnhold.ektefelle?.formue)
                                                : getInitialVerdier(),
                                        });

                                        setInputToShow('søker');
                                    }}
                                />
                            </RadioGruppe>
                            {formik.values.borSøkerMedEPS && (
                                <>
                                    <Element>
                                        {intl.formatMessage({ id: 'input.label.ektefellesFødselsnummer' })}
                                    </Element>
                                    <div className={styles.fnrInput}>
                                        <Input
                                            name="epsFnr"
                                            value={formik.values.epsFnr ?? ''}
                                            onChange={(e) =>
                                                formik.setValues((values) => ({
                                                    ...values,
                                                    epsFnr: removeSpaces(e.target.value),
                                                }))
                                            }
                                            bredde="S"
                                            feil={formik.errors.epsFnr}
                                        />
                                        <div className={styles.result}>
                                            {pipe(
                                                eps,
                                                RemoteData.fold(
                                                    () => null,
                                                    () => <NavFrontendSpinner />,
                                                    (err) => (
                                                        <AlertStripe type="feil">
                                                            {err.statusCode === ErrorCode.Unauthorized ? (
                                                                <ModalWrapper
                                                                    isOpen={true}
                                                                    onRequestClose={() => {
                                                                        return;
                                                                    }}
                                                                    contentLabel={intl.formatMessage({
                                                                        id: 'modal.skjerming.ariaBeskrivelse',
                                                                    })}
                                                                    closeButton={false}
                                                                    contentClass={styles.modalInnhold}
                                                                >
                                                                    <Undertittel>
                                                                        {intl.formatMessage({
                                                                            id: 'modal.skjerming.heading',
                                                                        })}
                                                                    </Undertittel>
                                                                    <Tekstomrade
                                                                        className={styles.modalTekst}
                                                                        rules={[BoldRule, HighlightRule, LinebreakRule]}
                                                                    >
                                                                        {intl.formatMessage(
                                                                            {
                                                                                id: 'modal.skjerming.innhold',
                                                                            },
                                                                            {
                                                                                navn: showName(props.søker.navn),
                                                                                fnr: søknadInnhold.personopplysninger
                                                                                    .fnr,
                                                                            }
                                                                        )}
                                                                    </Tekstomrade>
                                                                    <Knapp
                                                                        htmlType="button"
                                                                        onClick={handleEpsSkjermingModalContinueClick}
                                                                    >
                                                                        OK
                                                                    </Knapp>
                                                                </ModalWrapper>
                                                            ) : err.statusCode === ErrorCode.NotFound ? (
                                                                intl.formatMessage({ id: 'feilmelding.ikkeFunnet' })
                                                            ) : (
                                                                intl.formatMessage({ id: 'feilmelding.ukjent' })
                                                            )}
                                                        </AlertStripe>
                                                    ),
                                                    (person) => <Personkort person={person} />
                                                )
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

                                {formik.values.borSøkerMedEPS && (
                                    <>
                                        <ShowSum
                                            tittel={intl.formatMessage({ id: 'display.søkersFormue' })}
                                            sum={søkersFormue}
                                        />

                                        {inputToShow !== 'søker' ? (
                                            <div>
                                                <Knapp
                                                    className={styles.toggleInput}
                                                    onClick={() => {
                                                        if (kanEndreAnnenPersonsFormue) {
                                                            setInputToShow('søker');
                                                            setKanEndreAnnenPersonsFormue(false);
                                                        } else {
                                                            setÅpnerNyFormueBlokkMenViserEnBlokk(true);
                                                        }
                                                    }}
                                                    htmlType="button"
                                                >
                                                    {intl.formatMessage({ id: 'knapp.endreSøkersFormue' })}
                                                </Knapp>
                                                {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                    <Feilmelding>
                                                        {intl.formatMessage({
                                                            id: 'feil.åpnerAnnenPersonFormueMenViserInput',
                                                        })}
                                                    </Feilmelding>
                                                )}
                                            </div>
                                        ) : (
                                            <Knapp
                                                htmlType="button"
                                                className={styles.toggleInput}
                                                onClick={() => {
                                                    formik.validateForm().then((res) => {
                                                        if (Object.keys(res).length === 0) {
                                                            setInputToShow(null);
                                                            setKanEndreAnnenPersonsFormue(true);
                                                            setÅpnerNyFormueBlokkMenViserEnBlokk(false);
                                                        }
                                                    });
                                                }}
                                            >
                                                Lagre
                                            </Knapp>
                                        )}
                                    </>
                                )}
                            </div>

                            {formik.values.borSøkerMedEPS && (
                                <div className={inputToShow === 'ektefelle' ? styles.aktivFormueBlokk : undefined}>
                                    {inputToShow === 'ektefelle' &&
                                        keyNavnForFormue.map((keyNavn) => (
                                            <FormueInput
                                                key={keyNavn}
                                                tittel={intl.formatMessage({ id: `input.label.${keyNavn}` })}
                                                className={styles.formueInput}
                                                inputName={`epsVerdier.${keyNavn}`}
                                                onChange={formik.handleChange}
                                                defaultValue={formik.values.epsVerdier?.[keyNavn] ?? 0}
                                                feil={
                                                    (
                                                        formik.errors.epsVerdier as
                                                            | FormikErrors<FormueVerdier>
                                                            | undefined
                                                    )?.[keyNavn]
                                                }
                                            />
                                        ))}
                                    <ShowSum
                                        tittel={intl.formatMessage({ id: 'display.ektefellesFormue' })}
                                        sum={ektefellesFormue}
                                    />

                                    {inputToShow !== 'ektefelle' ? (
                                        <div>
                                            <Knapp
                                                className={styles.toggleInput}
                                                onClick={() => {
                                                    if (kanEndreAnnenPersonsFormue) {
                                                        setInputToShow('ektefelle');
                                                        setKanEndreAnnenPersonsFormue(false);
                                                    } else {
                                                        setÅpnerNyFormueBlokkMenViserEnBlokk(true);
                                                    }
                                                }}
                                                htmlType="button"
                                            >
                                                {intl.formatMessage({ id: 'knapp.endreEktefellesFormue' })}
                                            </Knapp>
                                            {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                <Feilmelding>
                                                    {intl.formatMessage({
                                                        id: 'feil.åpnerAnnenPersonFormueMenViserInput',
                                                    })}
                                                </Feilmelding>
                                            )}
                                        </div>
                                    ) : (
                                        <Knapp
                                            className={styles.toggleInput}
                                            htmlType="button"
                                            onClick={() => {
                                                formik.validateForm().then((res) => {
                                                    if (Object.keys(res).length === 0) {
                                                        setInputToShow(null);
                                                        setKanEndreAnnenPersonsFormue(true);
                                                        setÅpnerNyFormueBlokkMenViserEnBlokk(false);
                                                    }
                                                });
                                            }}
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
                        <Feiloppsummering
                            tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                            feil={formikErrorsTilFeiloppsummering(formik.errors)}
                            hidden={!formikErrorsHarFeil(formik.errors)}
                        />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                formik.validateForm().then((res) => {
                                    if (Object.keys(res).length === 0) {
                                        handleSave(
                                            formik.values,
                                            Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId })
                                        );
                                    }
                                });
                            }}
                        />
                    </form>
                ),
                right: <FormueFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Formue;
