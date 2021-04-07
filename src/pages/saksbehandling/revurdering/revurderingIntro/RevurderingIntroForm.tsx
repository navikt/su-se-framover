import * as RemoteData from '@devexperts/remote-data-ts';
import classNames from 'classnames';
import * as DateFns from 'date-fns';
import { useFormik } from 'formik';
import AlertStripe from 'nav-frontend-alertstriper';
import { Select, Textarea } from 'nav-frontend-skjema';
import { Ingress, Innholdstittel, Feilmelding } from 'nav-frontend-typografi';
import React, { useState } from 'react';
import DatePicker from 'react-datepicker';

import { ApiError } from '~api/apiClient';
import { getRevurderingsårsakMessageId } from '~features/revurdering/revurderingUtils';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { customFormikSubmit } from '~lib/formikUtils';
import { useI18n } from '~lib/hooks';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';

import { RevurderingBunnknapper } from '../bunnknapper/RevurderingBunnknapper';
import sharedStyles from '../revurdering.module.less';

import messages from './revurderingIntro-nb';
import styles from './revurderingIntro.module.less';

interface OpprettRevurderingFormData {
    fraOgMed: Nullable<Date>;
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: Nullable<string>;
}

const gyldigeÅrsaker = Object.values(OpprettetRevurderingGrunn).filter((x) => x !== OpprettetRevurderingGrunn.MIGRERT);

const schema = yup.object<OpprettRevurderingFormData>({
    fraOgMed: yup.date().nullable().required(),
    årsak: yup.mixed<OpprettetRevurderingGrunn>().nullable().oneOf(gyldigeÅrsaker).required(),
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

    const feilkodeTilFeilmelding = (feilkode: string | undefined) => {
        // Dette er unionen av feilkodene til opprett/oppdater
        switch (feilkode) {
            case 'fant_ikke_sak':
                return intl.formatMessage({ id: 'feil.fant.ikke.sak' });
            case 'fant_ikke_aktør_id':
                return intl.formatMessage({ id: 'feil.fant.ikke.aktør.id' });
            case 'kunne_ikke_opprette_oppgave':
                return intl.formatMessage({ id: 'feil.kunne.ikke.opprette.oppgave' });
            case 'fant_ikke_revurdering':
                return intl.formatMessage({ id: 'feil.fant.ikke.revurdering' });
            case 'ugyldig_periode':
                return intl.formatMessage({ id: 'feil.ugyldig.periode' });
            case 'ugyldig_tilstand':
                return intl.formatMessage({ id: 'feil.ugyldig.tilstand' });
            case 'ingenting_å_revurdere_i_perioden':
                return intl.formatMessage({ id: 'feil.kanIkkeRevurdere' });
            case 'tidligest_neste_måned':
                return intl.formatMessage({ id: 'feil.tidligst.neste.måned' });
            case 'begrunnelse_kan_ikke_være_tom':
                return intl.formatMessage({ id: 'feil.begrunnelse.kan.ikke.være.tom' });
            case 'ugyldig_årsak':
                return intl.formatMessage({ id: 'feil.ugyldig.årsak' });
            case 'perioden_må_være_innenfor_stønadsperioden':
                return intl.formatMessage({ id: 'feil.perioden.må.være.innenfor.stønadsperioden' });
            default:
                return intl.formatMessage({ id: 'feil.ukjentFeil' });
        }
    };

    const periode = formik.values.fraOgMed ? { fraOgMed: formik.values.fraOgMed } : null;
    return (
        <form className={sharedStyles.revurderingContainer} onSubmit={formik.handleSubmit}>
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
                        {gyldigeÅrsaker.map((grunn, index) => (
                            <option value={grunn} key={index}>
                                {intl.formatMessage({
                                    id: getRevurderingsårsakMessageId(grunn),
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
                {hasSubmitted() && RemoteData.isFailure(props.nesteClickStatus) && (
                    <AlertStripe type="feil" className={sharedStyles.alertstripe}>
                        {feilkodeTilFeilmelding(props.nesteClickStatus.error.body?.code)}
                    </AlertStripe>
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
