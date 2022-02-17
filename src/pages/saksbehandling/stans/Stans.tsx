import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, Loader, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router-dom';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import DatePicker from '~components/datePicker/DatePicker';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup, { getDateErrorMessage } from '~lib/validering';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { Revurdering, OpprettetRevurderingGrunn, StansAvYtelse } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from './stans-nb';
import styles from './stans.module.less';
import StansOppsummering from './stansOppsummering';

interface Props {
    sak: Sak;
}

interface FormData {
    årsak: Nullable<OpprettetRevurderingGrunn>;
    stansDato: Nullable<Date>;
    begrunnelse: string;
}

function hentDefaultVerdier(r: Nullable<Revurdering>): FormData {
    if (r) {
        return {
            stansDato: new Date(r.periode.fraOgMed),
            begrunnelse: r.begrunnelse ?? '',
            årsak: r.årsak,
        };
    }

    return {
        stansDato: null,
        begrunnelse: '',
        årsak: null,
    };
}

const Stans = (props: Props) => {
    const history = useHistory();
    const urlParams = Routes.useRouteParams<typeof Routes.stansRoute>();
    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId) ?? null;

    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });

    const [opprettStatus, opprettStans] = useAsyncActionCreator(revurderingActions.opprettStans);
    const [oppdaterStatus, oppdaterStans] = useAsyncActionCreator(revurderingActions.oppdaterStans);
    const status = RemoteData.combine(opprettStatus, oppdaterStatus);

    const { ...form } = useForm<FormData>({
        defaultValues: hentDefaultVerdier(revurdering),
        resolver: yupResolver(
            yup
                .object<FormData>({
                    stansDato: yup.date().required().typeError('Må velge dato'),
                    begrunnelse: yup.string().required(),
                    årsak: yup
                        .mixed()
                        .required()
                        .oneOf(
                            Object.values([OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING]),
                            'Må velge en gyldig årsak'
                        ),
                })
                .required()
        ),
    });

    const handleSubmit = async (values: FormData) => {
        const revurderingId = urlParams.revurderingId;
        if (!values.stansDato || !values.årsak) {
            return;
        }

        const args = {
            sakId: urlParams.sakId,
            fraOgMed: values.stansDato,
            årsak: values.årsak,
            begrunnelse: values.begrunnelse,
        };
        const onSuccess = (stansAvYtelse: StansAvYtelse) => {
            history.push(
                Routes.stansOppsummeringRoute.createURL({
                    sakId: urlParams.sakId,
                    revurderingId: stansAvYtelse.id,
                })
            );
        };

        revurderingId ? oppdaterStans({ ...args, revurderingId }, onSuccess) : opprettStans(args, onSuccess);
    };

    return (
        <Switch>
            <Route path={Routes.stansOppsummeringRoute.path}>
                <Heading level="1" size="large" className={styles.tittel}>
                    {formatMessage('stans.tittel')}
                </Heading>
                <StansOppsummering sak={props.sak} />
            </Route>
            <Route path="*">
                <form className={styles.pageContainer} onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
                    <Heading level="1" size="large" className={styles.tittel}>
                        {formatMessage('stans.tittel')}
                    </Heading>
                    <div className={styles.content}>
                        <Controller
                            control={form.control}
                            name="årsak"
                            render={({ field, fieldState }) => (
                                <Select
                                    error={fieldState.error?.message}
                                    value={field.value ?? undefined}
                                    onChange={field.onChange}
                                    label={formatMessage('stans.årsak.tittel')}
                                >
                                    <option>{formatMessage('stans.årsak.label')}</option>
                                    <option value={OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING}>
                                        {formatMessage(OpprettetRevurderingGrunn.MANGLENDE_KONTROLLERKLÆRING)}
                                    </option>
                                </Select>
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="stansDato"
                            render={({ field, fieldState }) => (
                                <DatePicker
                                    label={formatMessage('stans.dato.label')}
                                    dateFormat="MM/yyyy"
                                    showMonthYearPicker
                                    isClearable
                                    autoComplete="off"
                                    value={field.value}
                                    onChange={(date: Date | null) => field.onChange(date)}
                                    feil={getDateErrorMessage(fieldState.error)}
                                />
                            )}
                        />
                        <Controller
                            control={form.control}
                            name="begrunnelse"
                            render={({ field, fieldState }) => (
                                <Textarea
                                    label="Begrunnelse"
                                    name="begrunnelse"
                                    value={field.value}
                                    onChange={field.onChange}
                                    error={fieldState.error?.message}
                                />
                            )}
                        />
                        {RemoteData.isFailure(status) && (
                            <div className={styles.error}>
                                <ApiErrorAlert error={status.error} />
                            </div>
                        )}
                        <div className={styles.bunnknapper}>
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    if (urlParams.revurderingId) {
                                        return history.push(
                                            Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id })
                                        );
                                    }
                                    history.goBack();
                                }}
                            >
                                {formatMessage('stans.bunnknapper.tilbake')}
                            </Button>
                            <Button variant="secondary">
                                {formatMessage('stans.bunnknapper.neste')}
                                {(RemoteData.isPending(opprettStatus) || RemoteData.isPending(oppdaterStatus)) && (
                                    <Loader />
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </Route>
        </Switch>
    );
};

export default Stans;
