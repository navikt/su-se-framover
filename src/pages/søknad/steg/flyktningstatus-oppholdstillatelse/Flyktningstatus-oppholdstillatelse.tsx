import { Alert, Radio, RadioGroup, TextField } from '@navikt/ds-react';
import { useFormik } from 'formik';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { BooleanRadioGroup, CollapsableFormElementDescription } from '~/components/formElements/FormElements';
import søknadSlice, { SøknadState } from '~/features/søknad/søknad.slice';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SøknadSpørsmålsgruppe from '~features/søknad/søknadSpørsmålsgruppe/SøknadSpørsmålsgruppe';
import { TypeOppholdstillatelse } from '~features/søknad/types';
import { focusAfterTimeout } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { keyOf, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { useAppDispatch, useAppSelector } from '~redux/Store';

import Bunnknapper from '../../bunnknapper/Bunnknapper';
import sharedStyles from '../../steg-shared.module.less';
import sharedI18n from '../steg-shared-i18n';

import messages from './flyktningstatus-oppholdstillatelse-nb';

type FormData = SøknadState['flyktningstatus'];

const schema = yup.object<FormData>({
    erFlyktning: yup.boolean().nullable().required('Fyll ut om du er registrert flyktning'),
    erNorskStatsborger: yup.boolean().nullable().required('Fyll ut om du er norsk statsborger'),
    harOppholdstillatelse: yup
        .boolean()
        .nullable(true)
        .defined()
        .when('erNorskStatsborger', {
            is: false,
            then: yup.boolean().nullable().required('Fyll ut om du har oppholdstillatelse'),
        }),
    typeOppholdstillatelse: yup
        .mixed<Nullable<TypeOppholdstillatelse>>()
        .nullable(true)
        .defined()
        .when('harOppholdstillatelse', {
            is: true,
            then: yup
                .mixed()
                .nullable()
                .oneOf(Object.values(TypeOppholdstillatelse), 'Du må velge type oppholdstillatelse')
                .required(),
        }),
    statsborgerskapAndreLand: yup.boolean().nullable().required('Fyll ut om du har statsborgerskap i andre land'),
    statsborgerskapAndreLandFritekst: yup
        .string()
        .nullable(true)
        .defined()
        .when('statsborgerskapAndreLand', {
            is: true,
            then: yup.string().nullable().min(1).required('Fyll ut land du har statsborgerskap i'),
        }),
});

const FlyktningstatusOppholdstillatelse = (props: { forrigeUrl: string; nesteUrl: string; avbrytUrl: string }) => {
    const flyktningstatusFraStore = useAppSelector((s) => s.soknad.flyktningstatus);
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [hasSubmitted, setHasSubmitted] = React.useState(false);

    const save = (values: FormData) =>
        dispatch(
            søknadSlice.actions.flyktningstatusUpdated({
                erFlyktning: values.erFlyktning,
                erNorskStatsborger: values.erNorskStatsborger,
                harOppholdstillatelse: values.harOppholdstillatelse,
                typeOppholdstillatelse: values.typeOppholdstillatelse,
                statsborgerskapAndreLand: values.statsborgerskapAndreLand,
                statsborgerskapAndreLandFritekst: values.statsborgerskapAndreLandFritekst,
            })
        );

    const formik = useFormik<FormData>({
        initialValues: {
            erFlyktning: flyktningstatusFraStore.erFlyktning,
            erNorskStatsborger: flyktningstatusFraStore.erNorskStatsborger,
            harOppholdstillatelse: flyktningstatusFraStore.harOppholdstillatelse,
            typeOppholdstillatelse: flyktningstatusFraStore.typeOppholdstillatelse,
            statsborgerskapAndreLand: flyktningstatusFraStore.statsborgerskapAndreLand,
            statsborgerskapAndreLandFritekst: flyktningstatusFraStore.statsborgerskapAndreLandFritekst,
        },
        onSubmit: (values) => {
            save(values);
            history.push(props.nesteUrl);
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted,
    });
    const feiloppsummeringref = React.useRef<HTMLDivElement>(null);

    const { formatMessage } = useI18n({ messages: { ...sharedI18n, ...messages } });

    return (
        <form
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
                focusAfterTimeout(feiloppsummeringref)();
            }}
            className={sharedStyles.container}
        >
            <SøknadSpørsmålsgruppe withoutLegend className={sharedStyles.formContainer}>
                <BooleanRadioGroup
                    name={keyOf<FormData>('erFlyktning')}
                    legend={formatMessage('flyktning.label')}
                    description={
                        <CollapsableFormElementDescription title={formatMessage('flyktning.hjelpetekst.tittel')}>
                            {formatMessage('flyktning.hjelpetekst.body')}
                        </CollapsableFormElementDescription>
                    }
                    error={formik.errors.erFlyktning}
                    value={formik.values.erFlyktning}
                    onChange={(val) =>
                        formik.setValues({
                            ...formik.values,
                            erFlyktning: val,
                        })
                    }
                />
                {formik.values.erFlyktning === false && (
                    <Alert variant="warning">{formatMessage('flyktning.måVæreFlyktning')}</Alert>
                )}
                <BooleanRadioGroup
                    name={keyOf<FormData>('erNorskStatsborger')}
                    legend={formatMessage('norsk.statsborger.label')}
                    error={formik.errors.erNorskStatsborger}
                    value={formik.values.erNorskStatsborger}
                    onChange={(val) =>
                        formik.setValues({
                            ...formik.values,
                            erNorskStatsborger: val,
                            harOppholdstillatelse: null,
                            typeOppholdstillatelse: null,
                        })
                    }
                />
                {formik.values.erNorskStatsborger === false && (
                    <BooleanRadioGroup
                        name={keyOf<FormData>('harOppholdstillatelse')}
                        legend={formatMessage('oppholdstillatelse.label')}
                        error={formik.errors.harOppholdstillatelse}
                        value={formik.values.harOppholdstillatelse}
                        onChange={(val) =>
                            formik.setValues({
                                ...formik.values,
                                harOppholdstillatelse: val,
                                typeOppholdstillatelse: null,
                            })
                        }
                    />
                )}
                {formik.values.harOppholdstillatelse === true && (
                    <RadioGroup
                        error={formik.errors.typeOppholdstillatelse}
                        legend={formatMessage('oppholdstillatelse.type')}
                        name={keyOf<FormData>('typeOppholdstillatelse')}
                        onChange={(value) => {
                            formik.setValues({
                                ...formik.values,
                                typeOppholdstillatelse: value as TypeOppholdstillatelse,
                            });
                        }}
                        value={formik.values.typeOppholdstillatelse?.toString() ?? ''}
                    >
                        <Radio id={keyOf<FormData>('typeOppholdstillatelse')} value={TypeOppholdstillatelse.Permanent}>
                            {formatMessage('oppholdstillatelse.permanent')}
                        </Radio>
                        <Radio value={TypeOppholdstillatelse.Midlertidig}>
                            {formatMessage('oppholdstillatelse.midlertidig')}
                        </Radio>
                    </RadioGroup>
                )}
                {formik.values.harOppholdstillatelse === false && (
                    <Alert variant="warning">{formatMessage('oppholdstillatelse.ikkeLovligOpphold')}</Alert>
                )}

                {formik.values.typeOppholdstillatelse === 'midlertidig' && (
                    <Alert variant="warning">{formatMessage('oppholdstillatelse.midlertidig.info')}</Alert>
                )}

                <BooleanRadioGroup
                    name={keyOf<FormData>('statsborgerskapAndreLand')}
                    legend={formatMessage('statsborger.andre.land.label')}
                    error={formik.errors.statsborgerskapAndreLand}
                    value={formik.values.statsborgerskapAndreLand}
                    onChange={(val) =>
                        formik.setValues({
                            ...formik.values,
                            statsborgerskapAndreLand: val,
                            statsborgerskapAndreLandFritekst: null,
                        })
                    }
                />
                {formik.values.statsborgerskapAndreLand && (
                    <TextField
                        id={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                        name={keyOf<FormData>('statsborgerskapAndreLandFritekst')}
                        className={sharedStyles.narrow}
                        label={formatMessage('statsborger.andre.land.fritekst')}
                        error={formik.errors.statsborgerskapAndreLandFritekst}
                        value={formik.values.statsborgerskapAndreLandFritekst || ''}
                        onChange={formik.handleChange}
                        autoComplete="off"
                        // Dette elementet vises ikke ved sidelast
                        // eslint-disable-next-line jsx-a11y/no-autofocus
                        autoFocus
                    />
                )}
            </SøknadSpørsmålsgruppe>
            <Feiloppsummering
                className={sharedStyles.marginBottom}
                tittel={formatMessage('feiloppsummering.title')}
                feil={formikErrorsTilFeiloppsummering(formik.errors)}
                hidden={!formikErrorsHarFeil(formik.errors)}
                ref={feiloppsummeringref}
            />

            <Bunnknapper
                previous={{
                    onClick: () => {
                        save(formik.values);
                        history.push(props.forrigeUrl);
                    },
                }}
                avbryt={{
                    toRoute: props.avbrytUrl,
                }}
            />
        </form>
    );
};

export default FlyktningstatusOppholdstillatelse;
