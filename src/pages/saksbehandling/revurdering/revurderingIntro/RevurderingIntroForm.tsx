import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Checkbox, CheckboxGroup, Heading, Label, Select, Textarea } from '@navikt/ds-react';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~api/apiClient';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import Feiloppsummering from '~components/feiloppsummering/Feiloppsummering';
import SkjemaelementFeilmelding from '~components/formElements/SkjemaelementFeilmelding';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formUtils';
import { useI18n } from '~lib/i18n';
import { keyOf, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { InformasjonSomRevurderes, InformasjonsRevurdering, OpprettetRevurderingGrunn } from '~types/Revurdering';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';

import messages from './revurderingIntro-nb';
import styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
}

const gyldigeÅrsaker = Object.values(OpprettetRevurderingGrunn).filter((x) => x !== OpprettetRevurderingGrunn.MIGRERT);

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().required(),
    begrunnelse: yup.string().nullable().required(),
    informasjonSomRevurderes: yup
        .array<InformasjonSomRevurderes>(
            yup.mixed<InformasjonSomRevurderes>().oneOf(Object.values(InformasjonSomRevurderes))
        )
        .min(1, 'Du må velge minst en ting å revurdere')
        .required(),
});

interface FormValues {
    fraOgMed: Date;
    årsak: OpprettetRevurderingGrunn;
    informasjonSomRevurderes: InformasjonSomRevurderes[];
    begrunnelse: string;
}

interface RevurderingIntroFormProps {
    onNesteClick: (arg: FormValues) => void;
    onLagreOgFortsettSenereClick: (arg: FormValues) => void;
    tilbakeUrl: string;
    revurdering?: InformasjonsRevurdering;
    minFraOgMed: Date;
    maxFraOgMed: Date;
    nesteClickStatus: RemoteData.RemoteData<ApiError, null>;
    lagreOgFortsettSenereClickStatus: RemoteData.RemoteData<ApiError, null>;
}

const getInitialÅrsak = (årsak: OpprettetRevurderingGrunn | null | undefined) => {
    if (!årsak || årsak == OpprettetRevurderingGrunn.MIGRERT) return null;
    return årsak;
};

enum SubmittedStatus {
    NOT_SUBMITTED,
    NESTE,
    LAGRE,
}

const RevurderingIntroForm = (props: RevurderingIntroFormProps) => {
    const { intl } = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [submittedStatus, setSubmittedStatus] = useState<SubmittedStatus>(SubmittedStatus.NOT_SUBMITTED);

    const hasSubmitted = () => submittedStatus === SubmittedStatus.NESTE || submittedStatus === SubmittedStatus.LAGRE;

    const formik = useFormik<OpprettRevurderingFormData>({
        initialValues: {
            fraOgMed: props.revurdering?.periode?.fraOgMed
                ? DateFns.parseISO(props.revurdering.periode.fraOgMed)
                : null,
            årsak: getInitialÅrsak(props.revurdering?.årsak),
            begrunnelse: props.revurdering?.begrunnelse ?? null,
            informasjonSomRevurderes: props.revurdering
                ? (Object.keys(props.revurdering.informasjonSomRevurderes) as InformasjonSomRevurderes[])
                : [],
        },
        async onSubmit(values) {
            if (values.fraOgMed && values.årsak && values.begrunnelse) {
                props.onNesteClick({
                    fraOgMed: values.fraOgMed,
                    årsak: values.årsak,
                    informasjonSomRevurderes: values.informasjonSomRevurderes,
                    begrunnelse: values.begrunnelse,
                });
            }
        },
        validationSchema: schema,
        validateOnChange: hasSubmitted(),
    });

    const periode = formik.values.fraOgMed ? { fraOgMed: formik.values.fraOgMed } : null;

    return (
        <form className={sharedStyles.revurderingContainer} onSubmit={formik.handleSubmit}>
            <div className={sharedStyles.mainContentContainer}>
                <Heading level="2" size="small">
                    {intl.formatMessage({ id: 'periode.overskrift' })}
                </Heading>
                <div className={styles.periodeContainer}>
                    <div className={classNames(styles.datoContainerWrapper)}>
                        <div className={styles.datoContainer}>
                            <Label as="label" htmlFor="fom">
                                {intl.formatMessage({ id: 'datovelger.fom.legend' })}
                            </Label>
                            <span>
                                <DatePicker
                                    id="fom"
                                    selected={formik.values.fraOgMed}
                                    onChange={(date) => {
                                        formik.setValues((v) => ({
                                            ...v,
                                            fraOgMed: Array.isArray(date) ? date[0] : date,
                                        }));
                                    }}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    selectsEnd
                                    startDate={periode?.fraOgMed}
                                    minDate={props.minFraOgMed}
                                    maxDate={props.maxFraOgMed}
                                    autoComplete="off"
                                />
                            </span>
                            {formik.errors.fraOgMed && (
                                <SkjemaelementFeilmelding>{formik.errors.fraOgMed}</SkjemaelementFeilmelding>
                            )}
                        </div>
                    </div>
                    <div className={styles.selectContainer}>
                        <Select
                            label={intl.formatMessage({ id: 'input.årsak.label' })}
                            onChange={(event) =>
                                formik.setValues((v) => ({
                                    ...v,
                                    årsak: event.target.value as OpprettetRevurderingGrunn,
                                }))
                            }
                            value={formik.values.årsak ?? ''}
                            error={formik.errors.årsak}
                        >
                            <option value="" disabled>
                                {intl.formatMessage({ id: 'input.årsak.value.default' })}
                            </option>
                            {gyldigeÅrsaker.map((grunn) => (
                                <option value={grunn} key={grunn}>
                                    {intl.formatMessage({
                                        id: getRevurderingsårsakMessageId(grunn),
                                    })}
                                </option>
                            ))}
                        </Select>
                    </div>

                    <div className={styles.årsakForRevurderingContainer}>
                        <CheckboxGroup
                            legend={intl.formatMessage({ id: 'input.informasjonSomRevurderes.label' })}
                            error={formik.errors.informasjonSomRevurderes}
                            value={formik.values.informasjonSomRevurderes}
                            onChange={(vals) =>
                                formik.setValues((v) => ({
                                    ...v,
                                    informasjonSomRevurderes: vals as InformasjonSomRevurderes[],
                                }))
                            }
                        >
                            {Object.values(InformasjonSomRevurderes).map((i, idx) => (
                                <Checkbox
                                    key={i}
                                    id={idx === 0 ? keyOf<FormValues>('informasjonSomRevurderes') : undefined}
                                    value={i}
                                >
                                    {intl.formatMessage({ id: messages[i] })}
                                </Checkbox>
                            ))}
                        </CheckboxGroup>
                    </div>

                    <div className={styles.informasjonsContainer}>
                        {formik.values.informasjonSomRevurderes.includes(InformasjonSomRevurderes.Bosituasjon) && (
                            <Alert variant="info">{intl.formatMessage({ id: 'info.bosituasjon' })}</Alert>
                        )}
                    </div>

                    <div className={styles.begrunnelsesContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.begrunnelse.label' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse ?? ''}
                            error={formik.errors.begrunnelse}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <Feiloppsummering
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                    />
                </div>
                {RemoteData.isFailure(props.nesteClickStatus) && <ApiErrorAlert error={props.nesteClickStatus.error} />}
                <RevurderingBunnknapper
                    onNesteClick={() => {
                        setSubmittedStatus(SubmittedStatus.NESTE);
                        return formik.submitForm();
                    }}
                    tilbakeUrl={props.tilbakeUrl}
                    onLagreOgFortsettSenereClick={() => {
                        setSubmittedStatus(SubmittedStatus.LAGRE);
                        customFormikSubmit(formik, async (values) =>
                            props.onLagreOgFortsettSenereClick({
                                /* eslint-disable @typescript-eslint/no-non-null-assertion */
                                fraOgMed: values.fraOgMed!,
                                årsak: values.årsak!,
                                informasjonSomRevurderes: values.informasjonSomRevurderes,
                                begrunnelse: values.begrunnelse!,
                                /* eslint-enable @typescript-eslint/no-non-null-assertion */
                            })
                        );
                    }}
                    onNesteClickSpinner={
                        submittedStatus === SubmittedStatus.NESTE && RemoteData.isPending(props.nesteClickStatus)
                    }
                    onLagreOgFortsettSenereClickSpinner={
                        submittedStatus === SubmittedStatus.LAGRE &&
                        RemoteData.isPending(props.lagreOgFortsettSenereClickStatus)
                    }
                />
            </div>
        </form>
    );
};

export default RevurderingIntroForm;
