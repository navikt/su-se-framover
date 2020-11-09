import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { eqPersonligOppmøte } from '~/features/behandling/behandlingUtils';
import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { GrunnForPapirinnsending } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Behandlingsstatus } from '~types/Behandling';
import { PersonligOppmøteStatus, PersonligOppmøte as PersonligOppmøteType } from '~types/Behandlingsinformasjon';
import { Søknadstype } from '~types/Søknad';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './personligOppmøte-nb';

enum GrunnForManglendePersonligOppmøte {
    SykMedLegeerklæringOgFullmakt = 'SykMedLegeerklæringOgFullmakt',
    OppnevntVergeSøktPerPost = 'OppnevntVergeSøktPerPost',
    KortvarigSykMedLegeerklæring = 'KortvarigSykdomMedLegeerklæring',
    MidlertidigUnntakFraOppmøteplikt = 'MidlertidigUnntakFraOppmøteplikt',
    BrukerIkkeMøttOppfyllerIkkeVilkår = 'BrukerIkkeMøttOppfyllerIkkeVilkår',
}

interface FormData {
    møttPersonlig: Nullable<boolean>;
    grunnForManglendePersonligOppmøte: Nullable<GrunnForManglendePersonligOppmøte>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    møttPersonlig: yup.boolean().required().typeError('Du må svare for å gå videre til neste steg.'),
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
                møttPersonlig: true,
                grunnForManglendePersonligOppmøte: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenVerge:
            return {
                møttPersonlig: false,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.OppnevntVergeSøktPerPost,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenSykMedLegeerklæringOgFullmakt:
            return {
                møttPersonlig: false,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.SykMedLegeerklæringOgFullmakt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenKortvarigSykMedLegeerklæring:
            return {
                møttPersonlig: false,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.KortvarigSykMedLegeerklæring,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttMenMidlertidigUnntakFraOppmøteplikt:
            return {
                møttPersonlig: false,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttPersonlig:
            return {
                møttPersonlig: false,
                grunnForManglendePersonligOppmøte: GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };
    }
};

const toPersonligOppmøteStatus = (formData: FormData): Nullable<PersonligOppmøteStatus> => {
    if (formData.møttPersonlig) {
        return PersonligOppmøteStatus.MøttPersonlig;
    } else {
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
    }
};

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const updateBehandlingsinformasjon = (personligOppmøte: PersonligOppmøteType) => {
        if (eqPersonligOppmøte.equals(personligOppmøte, props.behandling.behandlingsinformasjon.personligOppmøte)) {
            history.push(props.nesteUrl);
            return;
        }

        return dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: { ...personligOppmøte },
                },
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: getInitialFormValues(props.behandling.behandlingsinformasjon.personligOppmøte),
        async onSubmit(values) {
            const personligOppmøte = toPersonligOppmøteStatus(values);
            if (!personligOppmøte) {
                return;
            }

            const res = await updateBehandlingsinformasjon({
                status: personligOppmøte,
                begrunnelse: values.begrunnelse,
            });

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
                history.push(props.nesteUrl);
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const history = useHistory();

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
                        <SuperRadioGruppe
                            legend={intl.formatMessage({ id: 'radio.personligOppmøte.legend' })}
                            values={formik.values}
                            errors={formik.errors}
                            onChange={formik.setValues}
                            property="møttPersonlig"
                            options={[
                                {
                                    label: intl.formatMessage({ id: 'radio.label.ja' }),
                                    radioValue: true,
                                },
                                {
                                    label: intl.formatMessage({ id: 'radio.label.nei' }),
                                    radioValue: false,
                                },
                            ]}
                        />
                        {formik.values.møttPersonlig === false && (
                            <SuperRadioGruppe
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
                                        radioValue: GrunnForManglendePersonligOppmøte.MidlertidigUnntakFraOppmøteplikt,
                                    },
                                    {
                                        label: intl.formatMessage({
                                            id: 'radio.personligOppmøte.grunn.brukerIkkeMøttOppfyllerIkkeVilkår',
                                        }),
                                        radioValue: GrunnForManglendePersonligOppmøte.BrukerIkkeMøttOppfyllerIkkeVilkår,
                                    },
                                ]}
                            />
                        )}
                        <Textarea
                            label={intl.formatMessage({ id: 'input.label.begrunnelse' })}
                            name="begrunnelse"
                            feil={formik.errors.begrunnelse}
                            value={formik.values.begrunnelse ?? ''}
                            onChange={formik.handleChange}
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
                            onLagreOgFortsettSenereClick={() => {
                                const personligOppmøteStatus = toPersonligOppmøteStatus(formik.values);
                                if (!personligOppmøteStatus) return;

                                updateBehandlingsinformasjon({
                                    status: personligOppmøteStatus,
                                    begrunnelse: formik.values.begrunnelse,
                                });
                            }}
                        />
                    </form>
                ),
                right: (
                    <Faktablokk
                        tittel={intl.formatMessage({ id: 'display.fraSøknad' })}
                        fakta={
                            props.behandling.søknad.søknadInnhold.forNav.type === Søknadstype.DigitalSøknad
                                ? [
                                      {
                                          tittel: intl.formatMessage({ id: 'display.fraSøknad.hvemHarMøtt' }),
                                          verdi:
                                              props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge ===
                                              null
                                                  ? intl.formatMessage({ id: 'display.fraSøknad.personligOppmøte' })
                                                  : props.behandling.søknad.søknadInnhold.forNav
                                                        .harFullmektigEllerVerge,
                                      },
                                  ]
                                : [
                                      {
                                          tittel: intl.formatMessage({
                                              id: 'display.fraSøknad.papirsøknad.grunnForPapirinnsending',
                                          }),
                                          verdi:
                                              props.behandling.søknad.søknadInnhold.forNav.grunnForPapirinnsending ===
                                              GrunnForPapirinnsending.Annet
                                                  ? props.behandling.søknad.søknadInnhold.forNav.annenGrunn ?? '-'
                                                  : props.behandling.søknad.søknadInnhold.forNav
                                                        .grunnForPapirinnsending,
                                      },
                                  ]
                        }
                    />
                ),
            }}
        </Vurdering>
    );
};

export default PersonligOppmøte;
