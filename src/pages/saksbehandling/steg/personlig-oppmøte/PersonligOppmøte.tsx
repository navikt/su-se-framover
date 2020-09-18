import * as RemoteData from '@devexperts/remote-data-ts';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Textarea } from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Vergemål } from '~features/søknad/types';
import { pipe } from '~lib/fp';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { PersonligOppmøteStatus, PersonligOppmøte as PersonligOppmøteType } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import sharedI18n from '../sharedI18n-nb';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

import messages from './personligOppmøte-nb';

enum MøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Verge = 'Verge',
    Fullmektig = 'Fullmektig',
}
interface FormData {
    status: Nullable<MøttPersonlig>;
    legeattest: Nullable<boolean>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf([MøttPersonlig.Ja, MøttPersonlig.Nei, MøttPersonlig.Verge, MøttPersonlig.Fullmektig]),
    legeattest: yup.boolean().nullable().defined().when('status', {
        is: MøttPersonlig.Fullmektig,
        then: yup.boolean().required(),
        otherwise: yup.boolean().nullable().defined(),
    }),
    begrunnelse: yup.string().nullable().defined(),
});

const getInitialFormValues = (
    personligOppmøteFraBehandlingsinformasjon: Nullable<PersonligOppmøteType>,
    harFullmektigEllerVergeFraSøknad: Nullable<Vergemål>
): FormData => {
    if (!personligOppmøteFraBehandlingsinformasjon) {
        if (!harFullmektigEllerVergeFraSøknad) {
            return {
                status: MøttPersonlig.Ja,
                begrunnelse: null,
                legeattest: null,
            };
        }
        return {
            status: harFullmektigEllerVergeFraSøknad === 'verge' ? MøttPersonlig.Verge : MøttPersonlig.Fullmektig,
            begrunnelse: null,
            legeattest: null,
        };
    }
    switch (personligOppmøteFraBehandlingsinformasjon.status) {
        case PersonligOppmøteStatus.FullmektigMedLegeattest:
            return {
                status: MøttPersonlig.Fullmektig,
                legeattest: true,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.FullmektigUtenLegeattest:
            return {
                status: MøttPersonlig.Fullmektig,
                legeattest: false,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.MøttPersonlig:
            return {
                status: MøttPersonlig.Ja,
                legeattest: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.IkkeMøttOpp:
            return {
                status: MøttPersonlig.Nei,
                legeattest: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };

        case PersonligOppmøteStatus.Verge:
            return {
                status: MøttPersonlig.Verge,
                legeattest: null,
                begrunnelse: personligOppmøteFraBehandlingsinformasjon.begrunnelse,
            };
    }
};

const toPersonligOppmøteStatus = (formData: FormData): Nullable<PersonligOppmøteStatus> => {
    switch (formData.status) {
        case MøttPersonlig.Ja:
            return PersonligOppmøteStatus.MøttPersonlig;
        case MøttPersonlig.Nei:
            return PersonligOppmøteStatus.IkkeMøttOpp;
        case MøttPersonlig.Verge:
            return PersonligOppmøteStatus.Verge;
        case MøttPersonlig.Fullmektig:
            return formData.legeattest
                ? PersonligOppmøteStatus.FullmektigMedLegeattest
                : PersonligOppmøteStatus.FullmektigUtenLegeattest;
        case null:
            return null;
    }
};

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const lagreBehandlingsinformasjonStatus = useAppSelector((s) => s.sak.lagreBehandlingsinformasjonStatus);
    const intl = useI18n({ messages: { ...sharedI18n, ...messages } });

    const updateBehandlingsinformasjon = (personligOppmøte: PersonligOppmøteType) =>
        dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: { status: personligOppmøte.status, begrunnelse: personligOppmøte.begrunnelse },
                },
            })
        );

    const formik = useFormik<FormData>({
        initialValues: getInitialFormValues(
            props.behandling.behandlingsinformasjon.personligOppmøte,
            props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge
        ),
        async onSubmit(values) {
            const personligOppmøte = toPersonligOppmøteStatus(values);
            if (!personligOppmøte) {
                return;
            }

            const res = await updateBehandlingsinformasjon({
                status: personligOppmøte,
                begrunnelse: values.begrunnelse,
            });

            if (lagreBehandlingsinformasjon.fulfilled.match(res)) {
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
                            property="status"
                            options={[
                                {
                                    label: intl.formatMessage({ id: 'radio.label.ja' }),
                                    radioValue: MøttPersonlig.Ja,
                                },
                                {
                                    label: intl.formatMessage({ id: 'radio.label.søkerHarVerge' }),
                                    radioValue: MøttPersonlig.Verge,
                                },
                                {
                                    label: intl.formatMessage({ id: 'radio.label.søkerHarFullmektig' }),
                                    radioValue: MøttPersonlig.Fullmektig,
                                },
                                {
                                    label: intl.formatMessage({ id: 'radio.label.nei' }),
                                    radioValue: MøttPersonlig.Nei,
                                },
                            ]}
                        />
                        {formik.values.status === MøttPersonlig.Fullmektig && (
                            <SuperRadioGruppe
                                legend={intl.formatMessage({ id: 'radio.legeattest.legend' })}
                                values={formik.values}
                                errors={formik.errors}
                                onChange={formik.setValues}
                                property="legeattest"
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
                        fakta={[
                            {
                                tittel: intl.formatMessage({ id: 'display.fraSøknad.hvemHarMøtt' }),
                                verdi:
                                    props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge === null
                                        ? intl.formatMessage({ id: 'display.fraSøknad.personligOppmøte' })
                                        : props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge,
                            },
                        ]}
                    />
                ),
            }}
        </Vurdering>
    );
};

export default PersonligOppmøte;
