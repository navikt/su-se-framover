import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Checkbox, CheckboxGruppe, Feiloppsummering, Select, Textarea } from 'nav-frontend-skjema';
import { Ingress, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~api/apiClient';
import RevurderingskallFeilet from '~components/revurdering/revurderingskallFeilet/RevurderingskallFeilet';
import { getRevurderingsårsakMessageId } from '~features/revurdering/revurderingUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import { keyOf, Nullable } from '~lib/types';
import yup, { formikErrorsHarFeil, formikErrorsTilFeiloppsummering } from '~lib/validering';
import { InformasjonSomRevurderes, OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';

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
    revurdering?: Revurdering;
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

const informasjonSomRevurderesMessageId = (i: InformasjonSomRevurderes) => {
    switch (i) {
        case InformasjonSomRevurderes.Uførhet:
            return 'informasjonSomRevurderes.uførhet';
        case InformasjonSomRevurderes.Inntekt:
            return 'informasjonSomRevurderes.inntekt';
        case InformasjonSomRevurderes.Bosituasjon:
            return 'informasjonSomRevurderes.bosituasjon';
        case InformasjonSomRevurderes.Formue:
            return 'informasjonSomRevurderes.formue';
    }
};

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
                <Ingress>{intl.formatMessage({ id: 'periode.overskrift' })}</Ingress>
                <div className={styles.periodeContainer}>
                    <div className={classNames(styles.datoContainerWrapper)}>
                        <div className={styles.datoContainer}>
                            <label htmlFor="fom">{intl.formatMessage({ id: 'datovelger.fom.legend' })}</label>
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
                            {formik.errors.fraOgMed && <Feilmelding>{formik.errors.fraOgMed}</Feilmelding>}
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
                            feil={formik.errors.årsak}
                        >
                            <option value="" disabled>
                                {intl.formatMessage({ id: 'input.årsak.value.default' })}
                            </option>
                            {gyldigeÅrsaker.map((grunn) => {
                                return (
                                    <option value={grunn} key={grunn}>
                                        {intl.formatMessage({
                                            id: getRevurderingsårsakMessageId(grunn),
                                        })}
                                    </option>
                                );
                            })}
                        </Select>
                    </div>

                    <div className={styles.årsakForRevurderingContainer}>
                        <CheckboxGruppe
                            legend={intl.formatMessage({ id: 'input.informasjonSomRevurderes.label' })}
                            feil={formik.errors.informasjonSomRevurderes}
                        >
                            {Object.values(InformasjonSomRevurderes).map((i, idx) => (
                                <Checkbox
                                    key={i}
                                    id={idx === 0 ? keyOf<FormValues>('informasjonSomRevurderes') : undefined}
                                    label={intl.formatMessage({ id: informasjonSomRevurderesMessageId(i) })}
                                    checked={formik.values.informasjonSomRevurderes.includes(i)}
                                    onChange={(e) => {
                                        return formik.setValues({
                                            ...formik.values,
                                            informasjonSomRevurderes: e.target.checked
                                                ? [...formik.values.informasjonSomRevurderes, i]
                                                : formik.values.informasjonSomRevurderes.filter((i2) => i2 !== i),
                                        });
                                    }}
                                />
                            ))}
                        </CheckboxGruppe>
                    </div>

                    <div className={styles.informasjonsContainer}>
                        {formik.values.informasjonSomRevurderes.includes(InformasjonSomRevurderes.Bosituasjon) && (
                            <AlertStripeInfo>{intl.formatMessage({ id: 'info.bosituasjon' })}</AlertStripeInfo>
                        )}
                    </div>

                    <div className={styles.begrunnelsesContainer}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.begrunnelse.label' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse ?? ''}
                            feil={formik.errors.begrunnelse}
                            onChange={formik.handleChange}
                        />
                    </div>
                    <Feiloppsummering
                        tittel={intl.formatMessage({ id: 'feiloppsummering.title' })}
                        hidden={!formikErrorsHarFeil(formik.errors)}
                        feil={formikErrorsTilFeiloppsummering(formik.errors)}
                    />
                </div>
                {RemoteData.isFailure(props.nesteClickStatus) && (
                    <RevurderingskallFeilet error={props.nesteClickStatus.error} />
                )}
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
