import { useFormik } from 'formik';
import { Radio, RadioGruppe, Textarea } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { lagreBehandlingsinformasjon } from '~features/saksoversikt/sak.slice';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { useAppDispatch } from '~redux/Store';
import { PersonligOppmøteStatus } from '~types/Behandlingsinformasjon';

import Faktablokk from './Faktablokk';
import { VilkårsvurderingBaseProps } from './types';
import { Vurdering, Vurderingknapper } from './Vurdering';

enum MøttPersonlig {
    Ja = 'Ja',
    Nei = 'Nei',
    Verge = 'Verge',
    Fullmektig = 'Fullmektig',
}
interface FormData {
    status: Nullable<MøttPersonlig>;
    legeattest: Nullable<boolean>;
}

const schema = yup.object<FormData>({
    status: yup
        .mixed()
        .defined()
        .oneOf([MøttPersonlig.Ja, MøttPersonlig.Nei, MøttPersonlig.Verge, MøttPersonlig.Fullmektig]),
    legeattest: yup.boolean().required(),
});

const PersonligOppmøte = (props: VilkårsvurderingBaseProps) => {
    const dispatch = useAppDispatch();
    const updateBehandlingsinformasjon = (personligOppmøte: PersonligOppmøteStatus) => {
        dispatch(
            lagreBehandlingsinformasjon({
                sakId: props.sakId,
                behandlingId: props.behandling.id,
                behandlingsinformasjon: { personligOppmøte: { status: personligOppmøte, begrunnelse: null } },
            })
        );
    };

    const onInit = (personligOppmøteStatus: PersonligOppmøteStatus | undefined): FormData => {
        if (!personligOppmøteStatus) {
            return {
                status: null,
                legeattest: null,
            };
        }

        switch (personligOppmøteStatus) {
            case PersonligOppmøteStatus.FullmektigMedLegeattest:
                return {
                    status: MøttPersonlig.Fullmektig,
                    legeattest: true,
                };

            case PersonligOppmøteStatus.FullmektigUtenLegeattest:
                return {
                    status: MøttPersonlig.Fullmektig,
                    legeattest: false,
                };

            case PersonligOppmøteStatus.MøttPersonlig:
                return {
                    status: MøttPersonlig.Ja,
                    legeattest: null,
                };

            case PersonligOppmøteStatus.IkkeMøttOpp:
                return {
                    status: MøttPersonlig.Nei,
                    legeattest: null,
                };

            case PersonligOppmøteStatus.Verge:
                return {
                    status: MøttPersonlig.Verge,
                    legeattest: null,
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

    const formik = useFormik<FormData>({
        initialValues: onInit(props.behandling.behandlingsinformasjon.personligOppmøte?.status),
        onSubmit(values) {
            const personligOppmøte = toPersonligOppmøteStatus(values);
            if (!personligOppmøte) {
                return;
            }

            updateBehandlingsinformasjon(personligOppmøte);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
    });

    const history = useHistory();
    const onChange = (status: MøttPersonlig) => {
        formik.setValues({
            ...formik.values,
            status,
        });
    };
    const onLegeattestChange = (legeattest: boolean) => {
        formik.setValues({
            ...formik.values,
            legeattest: legeattest,
        });
    };

    return (
        <Vurdering tittel="Personlig oppmøte?">
            {{
                left: (
                    <form onSubmit={formik.handleSubmit}>
                        <RadioGruppe legend="Har søker møtt personlig?">
                            <Radio
                                label="Ja"
                                name="MøttPersonlig"
                                onChange={() => onChange(MøttPersonlig.Ja)}
                                checked={formik.values.status === MøttPersonlig.Ja}
                            />
                            <Radio
                                label="Søker har verge"
                                name="verge"
                                onChange={() => onChange(MøttPersonlig.Verge)}
                                checked={formik.values.status === MøttPersonlig.Verge}
                            />
                            <Radio
                                label="Fullmektig har møtt på vegne av søker"
                                name="fullmektig"
                                onChange={() => onChange(MøttPersonlig.Fullmektig)}
                                checked={formik.values.status === MøttPersonlig.Fullmektig}
                            />
                            <Radio
                                label="Nei"
                                name="IkkeMøttOpp"
                                onChange={() => onChange(MøttPersonlig.Nei)}
                                checked={formik.values.status === MøttPersonlig.Nei}
                            />
                        </RadioGruppe>
                        {formik.values.status === MøttPersonlig.Fullmektig && (
                            <RadioGruppe legend="Legeattest?">
                                <Radio
                                    label="Ja"
                                    name="HarLegeattest"
                                    onChange={() => onLegeattestChange(true)}
                                    checked={Boolean(formik.values.legeattest)}
                                />
                                <Radio
                                    label="Nei"
                                    name="HarIkkeLegeattest"
                                    onChange={() => {
                                        onLegeattestChange(false);
                                    }}
                                    checked={formik.values.legeattest === false}
                                />
                            </RadioGruppe>
                        )}
                        <Textarea label="Begrunnelse" name="begrunnelse" value="" onChange={formik.handleChange} />
                        <Vurderingknapper
                            onTilbakeClick={() => {
                                history.push(props.forrigeUrl);
                            }}
                            onLagreOgFortsettSenereClick={() => {
                                const personligOppmøteStatus = toPersonligOppmøteStatus(formik.values);
                                if (!personligOppmøteStatus) return;

                                updateBehandlingsinformasjon(personligOppmøteStatus);
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
