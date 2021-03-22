import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Hovedknapp } from 'nav-frontend-knapper';
import { Select, Textarea } from 'nav-frontend-skjema';
import { Ingress, Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Link } from 'react-router-dom';

import { ApiError } from '~api/apiClient';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';

import sharedMessages from '../revurdering-nb';
import sharedStyles from '../revurdering.module.less';

import messages from './revurderingIntro-nb';
import styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
}

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().oneOf(Object.values(OpprettetRevurderingGrunn)).required(),
    begrunnelse: yup.string().nullable().required(),
});

function getTextId(grunn: OpprettetRevurderingGrunn) {
    switch (grunn) {
        case OpprettetRevurderingGrunn.MELDING_FRA_BRUKER:
            return 'input.årsak.value.meldingFraBruker';
        case OpprettetRevurderingGrunn.INFORMASJON_FRA_KONTROLLSAMTALE:
            return 'input.årsak.value.informasjonFraKontrollsamtale';
        case OpprettetRevurderingGrunn.DØDSFALL:
            return 'input.årsak.value.dødsfall';
        case OpprettetRevurderingGrunn.ANDRE_KILDER:
            return 'input.årsak.value.andreKilder';
        case OpprettetRevurderingGrunn.MIGRERT:
            return 'input.årsak.value.migrert';
    }
}

interface RevurderingIntroProps {
    onNesteClick: (fraOgMed: Date, årsak: OpprettetRevurderingGrunn, begrunnelse: string) => void;
    avbrytUrl: string;
    revurdering?: Revurdering;
    minFraOgMed: Date;
    maxFraOgMed: Date;
    nesteClickStatus: RemoteData.RemoteData<ApiError, null>;
}

const getInitialÅrsak = (årsak: OpprettetRevurderingGrunn | null | undefined) => {
    if (!årsak || årsak == OpprettetRevurderingGrunn.MIGRERT) return null;
    return årsak;
};

const RevurderingIntro = (props: RevurderingIntroProps) => {
    const intl = useI18n({ messages: { ...sharedMessages, ...messages } });
    const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);

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
        validateOnChange: hasSubmitted,
    });

    const periode = formik.values.fraOgMed ? { fraOgMed: formik.values.fraOgMed } : null;

    return (
        <form
            className={sharedStyles.revurderingContainer}
            onSubmit={(e) => {
                setHasSubmitted(true);
                formik.handleSubmit(e);
            }}
        >
            <Innholdstittel className={sharedStyles.tittel}>
                {intl.formatMessage({ id: 'revurdering.tittel' })}
            </Innholdstittel>
            <div className={sharedStyles.mainContentContainer}>
                <Ingress>{intl.formatMessage({ id: 'periode.overskrift' })}</Ingress>
                <div className={styles.periodeContainer}>
                    <div className={classNames(styles.datoContainerWrapper, styles.formElement)}>
                        <div className={styles.datoContainer}>
                            <label htmlFor="fom">{intl.formatMessage({ id: 'datovelger.fom.legend' })}</label>
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
                        {Object.values(OpprettetRevurderingGrunn)
                            .filter((x) => x !== OpprettetRevurderingGrunn.MIGRERT)
                            .map((grunn, index) => (
                                <option value={grunn} key={index}>
                                    {intl.formatMessage({
                                        id: getTextId(grunn),
                                    })}
                                </option>
                            ))}
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
                {hasSubmitted && RemoteData.isFailure(props.nesteClickStatus) && (
                    <AlertStripe type="feil" className={sharedStyles.alertstripe}>
                        {props.nesteClickStatus.error.body?.message}
                    </AlertStripe>
                )}
                <div className={sharedStyles.knappContainer}>
                    <Link className="knapp" to={props.avbrytUrl}>
                        {intl.formatMessage({ id: 'knapp.avslutt' })}
                    </Link>
                    <Hovedknapp spinner={RemoteData.isPending(props.nesteClickStatus)}>
                        {intl.formatMessage({ id: 'knapp.neste' })}
                    </Hovedknapp>
                </div>
            </div>
        </form>
    );
};

export default RevurderingIntro;
