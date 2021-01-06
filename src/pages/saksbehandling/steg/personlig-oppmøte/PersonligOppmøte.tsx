import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Feiloppsummering, Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqPersonligOppmøte, erUnderkjent } from '~/features/behandling/behandlingUtils';
import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { mapToVilkårsinformasjon, Vilkårsinformasjon } from '~features/saksoversikt/utils';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import {
    PersonligOppmøteStatus,
    PersonligOppmøte as PersonligOppmøteType,
    Behandlingsinformasjon,
} from '~types/Behandlingsinformasjon';
import { VilkårVurderingStatus } from '~types/Vilkårsvurdering';

import PersonligOppmøteFaktablokk from '../faktablokk/faktablokker/PersonligOppmøteFaktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './personligOppmøte-nb';
import styles from './personligOppmøte.module.less';

enum GrunnForManglendePersonligOppmøte {
    SykMedLegeerklæringOgFullmakt = 'SykMedLegeerklæringOgFullmakt',
    OppnevntVergeSøktPerPost = 'OppnevntVergeSøktPerPost',
    KortvarigSykMedLegeerklæring = 'KortvarigSykdomMedLegeerklæring',
    MidlertidigUnntakFraOppmøteplikt = 'MidlertidigUnntakFraOppmøteplikt',
    BrukerIkkeMøttOppfyllerIkkeVilkår = 'BrukerIkkeMøttOppfyllerIkkeVilkår',
}

enum HarMøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Uavklart = 'Uavklart',
}

interface FormData {
    møttPersonlig: Nullable<HarMøttPersonlig>;
    grunnForManglendePersonligOppmøte: Nullable<GrunnForManglendePersonligOppmøte>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    møttPersonlig: yup
        .mixed<HarMøttPersonlig>()
        .oneOf(Object.values(HarMøttPersonlig))
        .required()
        .typeError('Du må svare for å gå videre til neste steg.'),
    grunnForManglendePersonligOppmøte: yup
        .mixed<GrunnForManglendePersonligOppmøte>()
        .nullable()
        .defined()
        .when('møttPersonlig', {
            is: false,
            then: yup.string().defined().oneOf(Object.values(GrunnForManglendePersonligOppmøte)),
            otherwise: yup.string().nullable().defined(),
        }),
    begrunnelse: yup.string().nullable().defined(),
});

const getInitialFormValues = (personligOppmøteFraBehandlingsinformasjon: Nullable<PersonligOppmøteType>): FormData => {
    if (!personligOppmøteFraBehandlingsinformasjon) {
        return {
            møttPersonlig: null,
            grunnForManglendePersonligOppmøte: null,
            begrunnelse: null,
        };
    }
    switch (personligOppmøteFraBehandlingsinformasjon.status) {
        case PersonligOppmøteStatus.MøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Ja,
                grunnForManglendePersonligOppmøte: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenVerge:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return {
                møttPersonlig: HarMøttPersonlig.Nei,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.Uavklart:
            return {
                møttPersonlig: HarMøttPersonlig.Uavklart,
                grunnForManglendePersonligOppmøte: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };
    }
};

const toPersonligOppmøteStatus = (formData: FormData): Nullable<PersonligOppmøteStatus> => {
    if (formData.møttPersonlig === HarMøttPersonlig.Ja) {
        return PersonligOppmøteStatus.MøttPersonlig;
    }

    if (formData.møttPersonlig === HarMøttPersonlig.Uavklart) {
        return PersonligOppmøteStatus.Uavklart;
    }

    switch (formData.grunnForManglendePersonligOppmøte) {
        case GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost:
            return PersonligOppmøteStatus.IkkeMøttMenVerge;
        case GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt:
            return PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt;
        case GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring:
            return PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring;
        case GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt:
            return PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt;
        case GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår:
            return PersonligOppmøteStatus.IkkeMøttPersonlig;
        case null:
            return null;
    }
};

const tilOppdatertVilkårsinformasjon = (
    values: FormData,
    behandlingsinformasjon: Behandlingsinformasjon
): Vilkårsinformasjon[] | 'personligOppmøteIkkeVurdert' => {
    const s = toPersonligOppmøteStatus(values);
    if (!s) {
        return 'personligOppmøteIkkeVurdert';
    }
    return mapToVilkårsinformasjon({
        ...behandlingsinformasjon,
        personligOppmøte: {
            status: s,
            begrunnelse: values.begrunnelse,
        },
    });
};

const erAlleVilkårVurdert = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean =>
    vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeVurdert);

const erVurdertUtenAvslagMenIkkeFerdigbehandlet = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean => {
    return (
        erAlleVilkårVurdert(vilkårsinformasjon) &&
        vilkårsinformasjon.every((x) => x.status !== VilkårVurderingStatus.IkkeOk) &&
        vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.Uavklart)
    );
};

const erFerdigbehandletMedAvslag = (vilkårsinformasjon: Vilkårsinformasjon[]): boolean => {
    return (
        erAlleVilkårVurdert(vilkårsinformasjon) &&
        vilkårsinformasjon.some((x) => x.status === VilkårVurderingStatus.IkkeOk)
    );
};

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const handleLagreOgFortsettSenere = async (values: FormData) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }

        if (
            eqPersonligOppmøte.equals(
                { status: personligOppmøteStatus, begrunnelse: values.begrunnelse },
                props.behandling.behandlingsinformasjon.personligOppmøte
            )
        ) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                        begrunnelse: values.begrunnelse,
                    },
                },
            })
        );

        if (!res) return;

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sakId }));
        }
    };

    const handleSave = async (values: FormData, nesteUrl: string) => {
        const personligOppmøteStatus = toPersonligOppmøteStatus(values);
        if (!personligOppmøteStatus) {
            return;
        }

        const vilkårsinformasjon = tilOppdatertVilkårsinformasjon(values, props.behandling.behandlingsinformasjon);

        if (
            vilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
            erVurdertUtenAvslagMenIkkeFerdigbehandlet(vilkårsinformasjon) &&
            advarselRef.current
        ) {
            advarselRef.current.focus();
            return;
        }

        if (erUnderkjent(props.behandling)) {
            return history.push(
                Routes.saksbehandlingVedtak.createURL({
                    sakId: props.sakId,
                    behandlingId: props.behandling.id,
                })
            );
        }

        if (
            eqPersonligOppmøte.equals(
                { status: personligOppmøteStatus, begrunnelse: values.begrunnelse },
                props.behandling.behandlingsinformasjon.personligOppmøte
            ) &&
            props.behandling.status !== Behandlingsstatus.VILKÅRSVURDERT_AVSLAG
        ) {
            history.push(nesteUrl);
            return;
        }

        const res = await dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: {
                        status: personligOppmøteStatus,
                        begrunnelse: values.begrunnelse,
                    },
                },
            })
        );

        if (!res) return;

        if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
            if (res.payload.status === Behandlingsstatus.VILKÅRSVURDERT_AVSLAG) {
                return history.push(
                    Routes.saksbehandlingVedtak.createURL({
                        sakId: props.sakId,
                        behandlingId: props.behandling.id,
                    })
                );
            }
            history.push(nesteUrl);
        }
    };

    const advarselRef = useRef<HTMLDivElement>(null);

    const formik = useFormik<FormData>({
        initialValues: getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte),
        async onSubmit(values) {
            handleSave(values, props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const history = useHistory();

    const oppdatertVilkårsinformasjon = tilOppdatertVilkårsinformasjon(
        formik.values,
        props.behandling.behandlingsinformasjon
    );

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
                        <div className={styles.formElement}>
                            <SuperRadioGruppe
                                id="møttPersonlig"
                                legend={intl.formatMessage({ id: 'radio.personligOppmøte.legend' })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={formik.setValues}
                                property="møttPersonlig"
                                options={[
                                    {
                                        label: intl.formatMessage({ id: 'radio.label.ja' }),
                                        radioValue: HarMøttPersonlig.Ja,
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'radio.label.nei' }),
                                        radioValue: HarMøttPersonlig.Nei,
                                    },
                                    {
                                        label: intl.formatMessage({ id: 'radio.label.uavklart' }),
                                        radioValue: HarMøttPersonlig.Uavklart,
                                    },
                                ]}
                            />
                        </div>
                        {formik.values.møttPersonlig === HarMøttPersonlig.Nei && (
                            <div className={styles.formElement}>
                                <SuperRadioGruppe
                                    id="grunnForManglendePersonligOppmøte"
                                    legend={intl.formatMessage({ id: 'radio.personligOppmøte.grunn.legend' })}
                                    values={formik.values}
                                    errors={formik.errors}
                                    onChange={formik.setValues}
                                    property="grunnForManglendePersonligOppmøte"
                                    options={[
                                        {
                                            label: intl.formatMessage({
                                                id: 'radio.personligOppmøte.grunn.sykMedLegeerklæringOgFullmakt',
                                            }),
                                            radioValue: GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
                                        },
                                        {
                                            label: intl.formatMessage({
                                                id: 'radio.personligOppmøte.grunn.oppnevntVergeSøktPerPost',
                                            }),
                                            radioValue: GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
                                        },
                                        {
                                            label: intl.formatMessage({
                                                id: 'radio.personligOppmøte.grunn.kortvarigSykMedLegeerklæring',
                                            }),
                                            radioValue: GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
                                        },
                                        {
                                            label: intl.formatMessage({
                                                id: 'radio.personligOppmøte.grunn.midlertidigUnntakFraOppmøteplikt',
                                            }),
                                            radioValue:
                                                GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                                        },
                                        {
                                            label: intl.formatMessage({
                                                id: 'radio.personligOppmøte.grunn.brukerIkkeMøttOppfyllerIkkeVilkår',
                                            }),
                                            radioValue:
                                                GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                                        },
                                    ]}
                                />
                            </div>
                        )}
                        <div className={styles.formElement}>
                            <Textarea
                                label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                                name="begrunnelse"
                                feil={formik.errors.begrunnelse}
                                value={formik.values.begrunnelse ?? ''}
                                onChange={formik.handleChange}
                            />
                        </div>
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

                        <div
                            ref={advarselRef}
                            tabIndex={0}
                            aria-live="polite"
                            aria-atomic="true"
                            className={styles.alertstripe}
                        >
                            {oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                                erVurdertUtenAvslagMenIkkeFerdigbehandlet(oppdatertVilkårsinformasjon) && (
                                    <AlertStripe type="advarsel">
                                        {intl.formatMessage({ id: 'alert.ikkeFerdigbehandlet' })}
                                    </AlertStripe>
                                )}
                        </div>

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
                                        handleLagreOgFortsettSenere(formik.values);
                                    }
                                });
                            }}
                            nesteKnappTekst={
                                oppdatertVilkårsinformasjon !== 'personligOppmøteIkkeVurdert' &&
                                erFerdigbehandletMedAvslag(oppdatertVilkårsinformasjon)
                                    ? intl.formatMessage({ id: 'button.tilVedtak.label' })
                                    : undefined
                            }
                        />
                    </form>
                ),
                right: <PersonligOppmøteFaktablokk søknadInnhold={props.behandling.søknad.søknadInnhold} />,
            }}
        </Vurdering>
    );
};

export default PersonligOppmøte;
