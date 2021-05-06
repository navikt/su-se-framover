import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import { Select, Textarea } from 'nav-frontend-skjema';
import { Ingress, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~api/apiClient';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { erDatoFørStartenPåNesteMåned, startenPåForrigeMåned } from '~lib/dateUtils';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';
import RevurderingskallFeilet from '../revurderingskallFeilet/RevurderingskallFeilet';
import { getRevurderingsårsakMessageId } from '../revurderingUtils';

import messages from './revurderingIntro-nb';
import styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
}

const gyldigeÅrsaker = Object.values(OpprettetRevurderingGrunn).filter((x) => x !== OpprettetRevurderingGrunn.MIGRERT);

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup
        .date()
        .nullable()
        .required()
        .test({
            name: 'fraOgMed kan kun starte fra neste måned for årsaker som ikke er g-regulering',
            message: 'Du kan ikke velge en dato bakover i tid for årsaker som ikke er G-regulering',
            test: function (val) {
                const årsak = this.parent.årsak;

                if (
                    !DateFns.isBefore(val, startenPåForrigeMåned(new Date())) &&
                    årsak === OpprettetRevurderingGrunn.REGULER_GRUNNBELØP
                ) {
                    return true;
                }

                return !erDatoFørStartenPåNesteMåned(val);
            },
        }),
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().required(),
    begrunnelse: yup.string().nullable().required(),
});

interface RevurderingIntroFormProps {
    onNesteClick: (fraOgMed: Date, årsak: OpprettetRevurderingGrunn, begrunnelse: string) => void;
    onLagreOgFortsettSenereClick: (fraOgMed: Date, årsak: OpprettetRevurderingGrunn, begrunnelse: string) => void;
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

const RevurderingIntroForm = (props: RevurderingIntroFormProps) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [submittedStatus, setSubmittedStatus] = useState<SubmittedStatus>(SubmittedStatus.NOT_SUBMITTED);

    const hasSubmitted = () => submittedStatus === SubmittedStatus.NESTE || submittedStatus === SubmittedStatus.LAGRE;

    const formik = useFormik<OpprettRevurderingFormData>({
        initialValues: {
            fraOgMed: props.revurdering?.periode?.fraOgMed
                ? DateFns.parseISO(props.revurdering.periode.fraOgMed)
                : null,
            årsak: getInitialÅrsak(props.revurdering?.årsak),
            begrunnelse: props.revurdering?.begrunnelse ?? null,
        },
        async onSubmit(values) {
            if (values.fraOgMed && values.årsak && values.begrunnelse) {
                props.onNesteClick(values.fraOgMed, values.årsak, values.begrunnelse);
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
                    <div className={classNames(styles.datoContainerWrapper, styles.formElement)}>
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
                        className={styles.formElement}
                    >
                        <option value="" disabled>
                            {intl.formatMessage({ id: 'input.årsak.value.default' })}
                        </option>
                        {gyldigeÅrsaker.map((grunn) => {
                            if (
                                formik.values.fraOgMed &&
                                erDatoFørStartenPåNesteMåned(formik.values.fraOgMed) &&
                                grunn !== OpprettetRevurderingGrunn.REGULER_GRUNNBELØP
                            ) {
                                return (
                                    <option value={grunn} key={grunn} disabled>
                                        {intl.formatMessage({
                                            id: getRevurderingsårsakMessageId(grunn),
                                        })}
                                    </option>
                                );
                            }
                            return (
                                <option value={grunn} key={grunn}>
                                    {intl.formatMessage({
                                        id: getRevurderingsårsakMessageId(grunn),
                                    })}
                                </option>
                            );
                        })}
                    </Select>

                    <div className={styles.formElement}>
                        <Textarea
                            label={intl.formatMessage({ id: 'input.begrunnelse.label' })}
                            name="begrunnelse"
                            value={formik.values.begrunnelse ?? ''}
                            feil={formik.errors.begrunnelse}
                            onChange={formik.handleChange}
                        />
                    </div>
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
                            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                            props.onLagreOgFortsettSenereClick(values.fraOgMed!, values.årsak!, values.begrunnelse!)
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
