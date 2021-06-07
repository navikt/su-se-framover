import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Feiloppsummering, Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import { Element, Feilmelding } from 'nav-frontend-typografi';
import React, { useEffect, useState } from 'react';
import { IntlShape } from 'react-intl';
import { useHistory } from 'react-router-dom';

import { Sats as FaktiskSats } from '~/types/Sats';
import { ApiError } from '~api/apiClient';
import { Person, fetchPerson } from '~api/personApi';
import { SuperRadioGruppe } from '~components/FormElements';
import { Personkort } from '~components/Personkort';
import ToKolonner from '~components/toKolonner/ToKolonner';
import { eqBosituasjon } from '~features/behandling/behandlingUtils';
import { lagreBosituasjonGrunnlag } from '~features/saksoversikt/sak.slice';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Bosituasjon } from '~types/Grunnlag';
import { SøknadInnhold } from '~types/Søknad';

import { SatsFaktablokk } from '../faktablokk/faktablokker/SatsFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurderingknapper } from '../Vurdering';

import messages from './sats-nb';
import styles from './sats.module.less';

enum BosituasjonsValg {
    DELER_BOLIG_MED_VOKSNE = 'DELER_BOLIG_MED_VOKSNE',
    BOR_ALENE = 'BOR_ALENE',
    EPS_UFØR_FLYKTNING = 'EPS_UFØR_FLYKTNING',
    EPS_IKKE_UFØR_FLYKTNING = 'EPS_IKKE_UFØR_FLYKTNING',
    EPS_67_ELLER_OVER = 'EPS_67_ELLER_OVER',
}

interface FormData {
    delerSøkerBolig: Nullable<boolean>;
    mottarEktemakeEllerSamboerSU: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

interface SatsProps {
    behandlingId: string;
    eps: Nullable<Person>;
    søker: Person;
    bosituasjon: Nullable<Bosituasjon>;
    søknadInnhold: SøknadInnhold;
    forrigeUrl: string;
    nesteUrl: string;
    sakId: string;
    intl: IntlShape;
}

const tilBosituasjonsgrunnlag = (values: FormData, eps: Nullable<Person>) => {
    return {
        fnr: eps?.fnr ?? null,
        delerBolig: values.delerSøkerBolig,
        ektemakeEllerSamboerUførFlyktning: values.mottarEktemakeEllerSamboerSU,
        begrunnelse: values.begrunnelse,
    };
};

const tilBosituasjonsValg = (values: FormData, eps: Nullable<Person>): Nullable<BosituasjonsValg> => {
    if (eps && eps.alder) {
        if (eps.alder >= 67) {
            return BosituasjonsValg.EPS_67_ELLER_OVER;
        }

        if (values.mottarEktemakeEllerSamboerSU === null) return null;
        return values.mottarEktemakeEllerSamboerSU
            ? BosituasjonsValg.EPS_UFØR_FLYKTNING
            : BosituasjonsValg.EPS_IKKE_UFØR_FLYKTNING;
    }

    if (values.delerSøkerBolig === null) return null;
    return values.delerSøkerBolig ? BosituasjonsValg.DELER_BOLIG_MED_VOKSNE : BosituasjonsValg.BOR_ALENE;
};

const utledSats = (values: FormData, harEPS: boolean, epsAlder?: Nullable<number>) => {
    if (!values.delerSøkerBolig && values.delerSøkerBolig !== null) {
        return FaktiskSats.Høy;
    }

    if (harEPS && !epsAlder) {
        return 'Feil skjedde under utleding av sats';
    }

    if (values.delerSøkerBolig && !harEPS) {
        return FaktiskSats.Ordinær;
    }

    if (harEPS) {
        if (epsAlder && epsAlder < 67) {
            switch (values.mottarEktemakeEllerSamboerSU) {
                case null:
                    return null;
                case false:
                    return FaktiskSats.Høy;
                case true:
                    return FaktiskSats.Ordinær;
            }
        } else {
            return FaktiskSats.Ordinær;
        }
    }
    return null;
};

const getValidationSchema = (eps: Nullable<Person>) => {
    return yup.object<FormData>({
        delerSøkerBolig: yup
            .boolean()
            .defined()
            .test('deler søker bolig', 'Feltet må fylles ut', function (delerSøkerBolig) {
                if (!eps) {
                    return delerSøkerBolig !== null;
                }
                return true;
            }),
        mottarEktemakeEllerSamboerSU: yup
            .boolean()
            .defined()
            .test('eps mottar SU', 'Feltet må fylles ut', function (mottarSu) {
                if (eps && eps.alder && eps.alder < 67) {
                    return mottarSu !== null;
                }

                return true;
            }),
        begrunnelse: yup.string().defined(),
    });
};

const Sats = (props: VilkårsvurderingBaseProps) => {
    const [epsStatus, setEpsStatus] = useState<RemoteData.RemoteData<ApiError | undefined, Person>>(RemoteData.initial);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });
    const history = useHistory();
    const epsFnr = props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0].fnr;

    useEffect(() => {
        async function fetchEPS(fnr: string) {
            setEpsStatus(RemoteData.pending);

            const res = await fetchPerson(fnr);
            if (res.status === 'error') {
                setEpsStatus(RemoteData.failure(res.error));
            } else {
                setEpsStatus(RemoteData.success(res.data));
            }
        }

        if (epsFnr) {
            fetchEPS(epsFnr);
        }
    }, []);

    if (!epsFnr) {
        return (
            <SatsForm
                behandlingId={props.behandling.id}
                søker={props.søker}
                eps={null}
                bosituasjon={props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0] ?? null}
                søknadInnhold={props.behandling.søknad.søknadInnhold}
                forrigeUrl={props.forrigeUrl}
                nesteUrl={props.nesteUrl}
                sakId={props.sakId}
                intl={intl}
            />
        );
    }
    return pipe(
        epsStatus,
        RemoteData.fold(
            () => <NavFrontendSpinner />,
            () => <NavFrontendSpinner />,
            () => (
                <div className={styles.epsFeilContainer}>
                    <Feilmelding>{intl.formatMessage({ id: 'feilmelding.pdlFeil' })}</Feilmelding>
                    <Hovedknapp
                        onClick={() => {
                            history.push(props.forrigeUrl);
                        }}
                    >
                        {intl.formatMessage({ id: 'knapp.tilbake' })}
                    </Hovedknapp>
                </div>
            ),
            (eps) => (
                <SatsForm
                    behandlingId={props.behandling.id}
                    søker={props.søker}
                    eps={eps}
                    bosituasjon={props.behandling.grunnlagsdataOgVilkårsvurderinger.bosituasjon[0] ?? null}
                    søknadInnhold={props.behandling.søknad.søknadInnhold}
                    forrigeUrl={props.forrigeUrl}
                    nesteUrl={props.nesteUrl}
                    sakId={props.sakId}
                    intl={intl}
                />
            )
        )
    );
};

function mottarEktemakeEllerSamboerSUInitialValue(eps: Nullable<Person>, bosituasjon: Nullable<Bosituasjon>) {
    return eps && eps.alder && eps.alder >= 67 ? null : bosituasjon?.ektemakeEllerSamboerUførFlyktning ?? null;
}

function setInitialValues(eps: Nullable<Person>, bosituasjon: Nullable<Bosituasjon>) {
    return {
        delerSøkerBolig: eps ? null : bosituasjon?.delerBolig ?? null,
        mottarEktemakeEllerSamboerSU: mottarEktemakeEllerSamboerSUInitialValue(eps, bosituasjon),
        begrunnelse: bosituasjon?.begrunnelse ?? null,
    };
}

const SatsForm = (props: SatsProps) => {
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const eps = props.eps;

    const formik = useFormik<FormData>({
        initialValues: setInitialValues(eps, props.bosituasjon),
        validationSchema: getValidationSchema(eps),
        validateOnChange: hasSubmitted,
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
    });

    const handleSave = async (values: FormData, nesteUrl: string) => {
        const bosituasjonsvalg = tilBosituasjonsValg(values, eps);
        if (!bosituasjonsvalg) {
            return;
        }

        const bosituasjonsgrunnlag = tilBosituasjonsgrunnlag(values, eps);

        if (eqBosituasjon.equals(bosituasjonsgrunnlag, props.bosituasjon)) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBosituasjonGrunnlag({
                sakId: props.sakId,
                behandlingId: props.behandlingId,
                bosituasjon: bosituasjonsvalg,
                begrunnelse: values.begrunnelse,
            })
        );

        if (lagreBosituasjonGrunnlag.fulfilled.match(res)) {
            history.push(nesteUrl);
        }
    };

    return (
        <ToKolonner tittel={props.intl.formatMessage({ id: 'page.tittel' })}>
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <div>
                            {eps && (
                                <div className={styles.personkortContainer}>
                                    <Element className={styles.personkortTittel}>
                                        {props.intl.formatMessage({ id: 'display.eps.label' })}
                                    </Element>
                                    <Personkort person={eps} />
                                </div>
                            )}
                        </div>
                        {!eps && (
                            <RadioGruppe
                                legend={props.intl.formatMessage({ id: 'radio.delerSøkerBoligOver18.legend' })}
                                feil={formik.errors.delerSøkerBolig}
                            >
                                <Radio
                                    label={props.intl.formatMessage({ id: 'radio.label.ja' })}
                                    name="delerSøkerBolig"
                                    checked={formik.values.delerSøkerBolig === true}
                                    onChange={() => {
                                        formik.setValues((v) => ({
                                            ...v,
                                            delerSøkerBolig: true,
                                        }));
                                    }}
                                />
                                <Radio
                                    label={props.intl.formatMessage({ id: 'radio.label.nei' })}
                                    name="delerSøkerBolig"
                                    checked={formik.values.delerSøkerBolig === false}
                                    onChange={() => {
                                        formik.setValues((v) => ({
                                            ...v,
                                            delerSøkerBolig: false,
                                        }));
                                    }}
                                />
                            </RadioGruppe>
                        )}
                        {eps?.alder && eps.alder < 67 ? (
                            <SuperRadioGruppe
                                id="mottarEktemakeEllerSamboerSU"
                                legend={props.intl.formatMessage({
                                    id: 'radio.ektemakeEllerSamboerUførFlyktning.legend',
                                })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={(val) => {
                                    formik.setValues((v) => ({
                                        ...v,
                                        mottarEktemakeEllerSamboerSU: val.mottarEktemakeEllerSamboerSU,
                                    }));
                                }}
                                property="mottarEktemakeEllerSamboerSU"
                                options={[
                                    {
                                        label: props.intl.formatMessage({
                                            id: 'radio.label.ja',
                                        }),
                                        radioValue: true,
                                    },
                                    {
                                        label: props.intl.formatMessage({
                                            id: 'radio.label.nei',
                                        }),
                                        radioValue: false,
                                    },
                                ]}
                            />
                        ) : (
                            ''
                        )}
                        {utledSats(formik.values, Boolean(eps), eps?.alder) && (
                            <>
                                <hr />
                                <span>
                                    {`${props.intl.formatMessage({ id: 'display.sats' })} ${utledSats(
                                        formik.values,
                                        Boolean(eps),
                                        eps?.alder
                                    )}`}
                                </span>
                                <hr />
                                <hr />
                            </>
                        )}
                        <div className={styles.textareaContainer}>
                            <Textarea
                                label={props.intl.formatMessage({
                                    id: 'input.label.begrunnelse',
                                })}
                                name="begrunnelse"
                                value={formik.values.begrunnelse ?? ''}
                                feil={formik.errors.begrunnelse}
                                onChange={formik.handleChange}
                            />
                        </div>
                        {pipe(
                            lagreBehandlingsinformasjonStatus,
                            RemoteData.fold(
                                () => null,
                                () => (
                                    <NavFrontendSpinner>
                                        {props.intl.formatMessage({ id: 'display.lagre.lagrer' })}
                                    </NavFrontendSpinner>
                                ),
                                () => (
                                    <AlertStripe type="feil">
                                        {props.intl.formatMessage({ id: 'display.lagre.lagringFeilet' })}
                                    </AlertStripe>
                                ),
                                () => null
                            )
                        )}
                        <Feiloppsummering
                            tittel={props.intl.formatMessage({ id: 'feiloppsummering.title' })}
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
                right: <SatsFaktablokk søknadInnhold={props.søknadInnhold} />,
            }}
        </ToKolonner>
    );
};

export default Sats;
