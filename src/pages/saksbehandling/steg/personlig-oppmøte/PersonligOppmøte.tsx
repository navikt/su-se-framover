import { useFormik } from 'formik';
import { Textarea } from 'nav-frontend-skjema';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { SuperRadioGruppe } from '~components/FormElements';
import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Vergemål } from '~features/søknad/types';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { PersonligOppmøteStatus, PersonligOppmøte as PersonligOppmøteType } from '~types/Behandlingsinformasjon';

import Faktablokk from '../Faktablokk';
import { VilkårsvurderingBaseProps } from '../types';
import { Vurdering, Vurderingknapper } from '../Vurdering';

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

    const updateBehandlingsinformasjon = (personligOppmøte: PersonligOppmøteType) => {
        dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: {
                    personligOppmøte: { status: personligOppmøte.status, begrunnelse: personligOppmøte.begrunnelse },
                },
            })
        );
    };

    const formik = useFormik<FormData>({
        initialValues: getInitialFormValues(
            props.behandling.behandlingsinformasjon.personligOppmøte,
            props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge
        ),
        onSubmit(values) {
            const personligOppmøte = toPersonligOppmøteStatus(values);
            if (!personligOppmøte) {
                return;
            }

            updateBehandlingsinformasjon({ status: personligOppmøte, begrunnelse: values.begrunnelse });
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });

    const history = useHistory();

    return (
        <Vurdering tittel="Personlig oppmøte?">
            {{
                left: (
                    <form
                        onSubmit={(e) => {
                            setHasSubmitted(true);
                            formik.handleSubmit(e);
                        }}
                    >
                        <SuperRadioGruppe
                            legend="Har søker møtt personlig?"
                            values={formik.values}
                            errors={formik.errors}
                            onChange={formik.setValues}
                            property="status"
                            options={[
                                {
                                    label: 'Ja',
                                    radioValue: MøttPersonlig.Ja,
                                },
                                {
                                    label: 'Søker har verge',
                                    radioValue: MøttPersonlig.Verge,
                                },
                                {
                                    label: 'Fullmektig har møtt på vegne av søker',
                                    radioValue: MøttPersonlig.Fullmektig,
                                },
                                {
                                    label: 'Nei',
                                    radioValue: MøttPersonlig.Nei,
                                },
                            ]}
                        />
                        {formik.values.status === MøttPersonlig.Fullmektig && (
                            <SuperRadioGruppe
                                legend="Legeattest?"
                                values={formik.values}
                                errors={formik.errors}
                                onChange={formik.setValues}
                                property="legeattest"
                                options={[
                                    {
                                        label: 'Ja',
                                        radioValue: true,
                                    },
                                    {
                                        label: 'Nei',
                                        radioValue: false,
                                    },
                                ]}
                            />
                        )}
                        <Textarea
                            label="Begrunnelse"
                            name="begrunnelse"
                            feil={formik.errors.begrunnelse}
                            value={formik.values.begrunnelse ?? ''}
                            onChange={formik.handleChange}
                        />
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
                        tittel="Fra søknad"
                        fakta={[
                            {
                                tittel: 'Hvem har møtt opp?',
                                verdi:
                                    props.behandling.søknad.søknadInnhold.forNav.harFullmektigEllerVerge === null
                                        ? 'Personlig'
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
