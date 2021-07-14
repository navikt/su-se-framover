import * as RemoteData from '@devexperts/remote-data-ts';
import fnrValidator from '@navikt/fnrvalidator';
import { startOfMonth } from 'date-fns/esm';
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
import { FormueFaktablokk } from '~components/oppsummering/vilkårsOppsummering/faktablokk/faktablokker/FormueFaktablokk';
import { Personkort } from '~components/personkort/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import VilkårvurderingStatusIcon from '~components/VilkårvurderingStatusIcon';
import personSlice from '~features/person/person.slice';
import sakSlice, { lagreBehandlingsinformasjon, lagreEpsGrunnlag } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, {
    formikErrorsHarFeil,
    formikErrorsTilFeiloppsummering,
    validateStringAsNonNegativeNumber,
} from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandling } from '~types/Behandling';
import { FormueStatus, Formue } from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';
import { removeSpaces } from '~utils/format/formatUtils';
import { showName } from '~utils/person/personUtils';
import { hentBosituasjongrunnlag } from '~utils/søknadsbehandlingOgRevurdering/bosituasjon/bosituasjonUtils';
import {
    getSenesteHalvGVerdi,
    regnUtFormDataVerdier,
    VerdierFormData,
    verdierId,
} from '~utils/søknadsbehandlingOgRevurdering/formue/formueSøbOgRevUtils';

import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './formue-nb';
import styles from './formue.module.less';
import { FormueInput, ShowSum } from './FormueComponents';
import {
    FormueFormData,
    getFormueInitialValues,
    formDataVerdierTilFormueVerdier,
    eqFormue,
    eqEktefelle,
} from './utils';

const VerdierSchema: yup.ObjectSchema<VerdierFormData | undefined> = yup.object<VerdierFormData>({
    verdiPåBolig: validateStringAsNonNegativeNumber,
    verdiPåEiendom: validateStringAsNonNegativeNumber,
    verdiPåKjøretøy: validateStringAsNonNegativeNumber,
    innskuddsbeløp: validateStringAsNonNegativeNumber,
    verdipapir: validateStringAsNonNegativeNumber,
    stårNoenIGjeldTilDeg: validateStringAsNonNegativeNumber,
    kontanterOver1000: validateStringAsNonNegativeNumber,
    depositumskonto: validateStringAsNonNegativeNumber,
});

const schema = yup.object<FormueFormData>({
    status: yup
        .mixed()
        .required()
        .oneOf([FormueStatus.VilkårOppfylt, FormueStatus.MåInnhenteMerInformasjon, FormueStatus.VilkårIkkeOppfylt]),
    verdier: VerdierSchema.required(),
    epsVerdier: yup
        .object<VerdierFormData>()
        .when('borSøkerMedEPS', {
            is: true,
            then: VerdierSchema.required(),
            otherwise: yup.object().nullable().defined(),
        })
        .defined(),
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
    const history = useHistory();
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });
    const [eps, setEps] = useState<RemoteData.RemoteData<ApiError, personApi.Person>>(RemoteData.initial);
    const [kanEndreAnnenPersonsFormue, setKanEndreAnnenPersonsFormue] = useState<boolean>(true);
    const [åpnerNyFormueBlokkMenViserEnBlokk, setÅpnerNyFormueBlokkMenViserEnBlokk] = useState<boolean>(false);
    const søknadInnhold = props.behandling.søknad.søknadInnhold;
    const behandlingsInfo = props.behandling.behandlingsinformasjon;
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const [lagreEpsGrunnlagStatus, setLagreEpsGrunnlagStatus] = useState<RemoteData.RemoteData<ApiError, Behandling>>(
        RemoteData.initial
    );

    const handleSave = async (values: FormueFormData, nesteUrl: string) => {
        if (RemoteData.isPending(eps) && values.epsFnr !== null) return;

        const status =
            values.status === FormueStatus.MåInnhenteMerInformasjon
                ? FormueStatus.MåInnhenteMerInformasjon
                : totalFormue <= senesteHalvG
                ? FormueStatus.VilkårOppfylt
                : FormueStatus.VilkårIkkeOppfylt;

        const formueValues: Formue = {
            status,
            //Validering fanger denne
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            verdier: formDataVerdierTilFormueVerdier(values.verdier!),
            borSøkerMedEPS: values.borSøkerMedEPS,
            //Validering fanger denne
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            epsVerdier: values.borSøkerMedEPS ? formDataVerdierTilFormueVerdier(values.epsVerdier!) : null,
            begrunnelse: values.begrunnelse,
        };

        const ektefelle = { fnr: values.epsFnr };
        const erEktefelleUendret = eqEktefelle.equals(ektefelle, {
            fnr: hentBosituasjongrunnlag(props.behandling.grunnlagsdataOgVilkårsvurderinger)?.fnr,
        });

        if (eqFormue.equals(formueValues, props.behandling.behandlingsinformasjon.formue) && erEktefelleUendret) {
            history.push(nesteUrl);
            return;
        }

        setLagreEpsGrunnlagStatus(RemoteData.pending);
        await dispatch(
            lagreEpsGrunnlag({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                epsFnr: values.epsFnr,
            })
        ).then(async (epsGrunnlagRes) => {
            if (lagreEpsGrunnlag.fulfilled.match(epsGrunnlagRes)) {
                const res = await dispatch(
                    lagreBehandlingsinformasjon({
                        sakId: props.sakId,
                        behandlingId: props.behandling.id,
                        behandlingsinformasjon: { formue: formueValues },
                    })
                );

                if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
                    history.push(nesteUrl);
                }
            }
            if (lagreEpsGrunnlag.rejected.match(epsGrunnlagRes)) {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                setLagreEpsGrunnlagStatus(RemoteData.failure(epsGrunnlagRes.payload!));
            }
        });
    };

    const senesteHalvG = getSenesteHalvGVerdi(
        props.behandling.stønadsperiode?.periode?.fraOgMed
            ? startOfMonth(new Date(props.behandling.stønadsperiode.periode.fraOgMed))
            : null,
        props.behandling.grunnlagsdataOgVilkårsvurderinger.formue.formuegrenser
    );

    const formik = useFormik<FormueFormData>({
        initialValues: getFormueInitialValues(
            behandlingsInfo,
            søknadInnhold,
            props.behandling.grunnlagsdataOgVilkårsvurderinger
        ),
        async onSubmit() {
            handleSave(formik.values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const søkersFormue = useMemo(() => {
        return regnUtFormDataVerdier(formik.values.verdier);
    }, [formik.values.verdier]);

    const ektefellesFormue = useMemo(() => {
        return regnUtFormDataVerdier(formik.values.epsVerdier);
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

    const vilkårErOppfylt = totalFormue <= senesteHalvG;

    return (
        <ToKolonner tittel={formatMessage('page.tittel')}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div className={styles.ektefellePartnerSamboer}>
                            <Element>{formatMessage('input.label.borSøkerMedEktefelle')}</Element>
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
                                            epsVerdier: null,
                                        });

                                        setInputToShow('søker');
                                    }}
                                />
                            </RadioGruppe>
                            {formik.values.borSøkerMedEPS && (
                                <>
                                    <Element>{formatMessage('input.label.ektefellesFødselsnummer')}</Element>
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
                                                                    contentLabel={formatMessage(
                                                                        'modal.skjerming.ariaBeskrivelse'
                                                                    )}
                                                                    closeButton={false}
                                                                    contentClass={styles.modalInnhold}
                                                                >
                                                                    <Undertittel>
                                                                        {formatMessage('modal.skjerming.heading')}
                                                                    </Undertittel>
                                                                    <Tekstomrade
                                                                        className={styles.modalTekst}
                                                                        rules={[BoldRule, HighlightRule, LinebreakRule]}
                                                                    >
                                                                        {formatMessage('modal.skjerming.innhold', {
                                                                            navn: showName(props.søker.navn),
                                                                            fnr: søknadInnhold.personopplysninger.fnr,
                                                                        })}
                                                                    </Tekstomrade>
                                                                    <Knapp
                                                                        htmlType="button"
                                                                        onClick={handleEpsSkjermingModalContinueClick}
                                                                    >
                                                                        OK
                                                                    </Knapp>
                                                                </ModalWrapper>
                                                            ) : err.statusCode === ErrorCode.NotFound ? (
                                                                formatMessage('feilmelding.ikkeFunnet')
                                                            ) : (
                                                                formatMessage('feilmelding.ukjent')
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
                                    verdierId.map((keyNavn) => (
                                        <FormueInput
                                            key={keyNavn}
                                            tittel={formatMessage(`input.label.${keyNavn}`)}
                                            className={styles.formueInput}
                                            inputName={`verdier.${keyNavn}`}
                                            onChange={formik.handleChange}
                                            defaultValue={formik.values.verdier?.[keyNavn] ?? '0'}
                                            feil={
                                                (formik.errors.verdier as FormikErrors<VerdierFormData> | undefined)?.[
                                                    keyNavn
                                                ]
                                            }
                                        />
                                    ))}

                                {formik.values.borSøkerMedEPS && (
                                    <>
                                        <ShowSum tittel={formatMessage('display.søkersFormue')} sum={søkersFormue} />

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
                                                    {formatMessage('knapp.endreSøkersFormue')}
                                                </Knapp>
                                                {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                    <Feilmelding>
                                                        {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
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
                                        verdierId.map((keyNavn) => (
                                            <FormueInput
                                                key={keyNavn}
                                                tittel={formatMessage(`input.label.${keyNavn}`)}
                                                className={styles.formueInput}
                                                inputName={`epsVerdier.${keyNavn}`}
                                                onChange={formik.handleChange}
                                                defaultValue={formik.values.epsVerdier?.[keyNavn] ?? '0'}
                                                feil={
                                                    (
                                                        formik.errors.epsVerdier as
                                                            | FormikErrors<VerdierFormData>
                                                            | undefined
                                                    )?.[keyNavn]
                                                }
                                            />
                                        ))}
                                    <ShowSum
                                        tittel={formatMessage('display.ektefellesFormue')}
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
                                                {formatMessage('knapp.endreEktefellesFormue')}
                                            </Knapp>
                                            {åpnerNyFormueBlokkMenViserEnBlokk && (
                                                <Feilmelding>
                                                    {formatMessage('feil.åpnerAnnenPersonFormueMenViserInput')}
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
                            <ShowSum tittel={formatMessage('display.totalt')} sum={totalFormue} />

                            <div className={styles.status}>
                                <VilkårvurderingStatusIcon
                                    status={vilkårErOppfylt ? VilkårVurderingStatus.Ok : VilkårVurderingStatus.IkkeOk}
                                />
                                <div className={styles.statusInformasjon}>
                                    <p>
                                        {vilkårErOppfylt
                                            ? formatMessage('display.vilkårOppfylt')
                                            : formatMessage('display.vilkårIkkeOppfylt')}
                                    </p>
                                    <p>
                                        {vilkårErOppfylt
                                            ? formatMessage('display.vilkårOppfyltGrunn')
                                            : formatMessage('display.vilkårIkkeOppfyltGrunn')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Textarea
                            label={formatMessage('input.label.begrunnelse')}
                            name="begrunnelse"
                            value={formik.values.begrunnelse || ''}
                            onChange={formik.handleChange}
                            feil={formik.errors.begrunnelse}
                        />

                        <Checkbox
                            label={formatMessage('checkbox.henteMerInfo')}
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
                            RemoteData.combine(lagreBehandlingsinformasjonStatus, lagreEpsGrunnlagStatus),
                            RemoteData.fold(
                                () => null,
                                () => <NavFrontendSpinner>{formatMessage('display.lagre.lagrer')}</NavFrontendSpinner>,
                                (error) => (
                                    <AlertStripe type="feil">
                                        {error.body?.code === 'ugyldige_verdier_på_formue'
                                            ? formatMessage('feilmelding.ugyldigeVerdier.depositum')
                                            : formatMessage('display.lagre.lagringFeilet')}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}

                        <Feiloppsummering
                            tittel={formatMessage('feiloppsummering.title')}
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
