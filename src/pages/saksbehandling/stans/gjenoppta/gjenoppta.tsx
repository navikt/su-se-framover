import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Heading, Loader, Select, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import sharedMessages from '~pages/saksbehandling/revurdering/revurdering-nb';
import { Revurdering, OpprettetRevurderingGrunn, Gjenopptak } from '~types/Revurdering';
import { Sak } from '~types/Sak';

import messages from './gjenoppta-nb';
import styles from './gjenoppta.module.less';
import GjenopptaOppsummering from './gjenopptaOppsummering';

interface Props {
    sak: Sak;
}

interface FormData {
    årsak: Nullable<OpprettetRevurderingGrunn>;
    begrunnelse: string;
}

function hentDefaultVerdier(r: Nullable<Revurdering>): FormData {
    if (r) {
        return {
            begrunnelse: r.begrunnelse ?? '',
            årsak: r.årsak,
        };
    }

    return {
        begrunnelse: '',
        årsak: null,
    };
}

const Gjenoppta = (props: Props) => {
    const urlParams = Routes.useRouteParams<typeof Routes.gjenopptaStansRoute>();
    const { formatMessage } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const history = useHistory();

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [gjenopptaStatus, gjenoppta] = useAsyncActionCreator(revurderingActions.gjenoppta);
    const [oppdaterStatus, oppdaterGjenopptak] = useAsyncActionCreator(revurderingActions.oppdaterGjenopptak);
    const status = RemoteData.combine(gjenopptaStatus, oppdaterStatus);

    const { ...form } = useForm<FormData>({
        defaultValues: hentDefaultVerdier(revurdering ?? null),
        resolver: yupResolver(
            yup
                .object<FormData>({
                    begrunnelse: yup.string().required('Må fylles ut'),
                    årsak: yup
                        .mixed()
                        .required()
                        .oneOf(
                            Object.values([OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING]),
                            'Du må velge en gyldig årsak'
                        ),
                })
                .required()
        ),
    });

    const handleSubmit = async (values: FormData) => {
        const revurderingId = urlParams.revurderingId;
        if (!values.årsak) {
            return;
        }
        const args = {
            sakId: urlParams.sakId,
            årsak: values.årsak,
            begrunnelse: values.begrunnelse,
        };
        const onSuccess = (gjenopptak: Gjenopptak) => {
            history.push(
                Routes.gjenopptaStansOppsummeringRoute.createURL({
                    sakId: urlParams.sakId,
                    revurderingId: gjenopptak.id,
                })
            );
        };

        revurderingId ? oppdaterGjenopptak({ ...args, revurderingId }, onSuccess) : gjenoppta(args, onSuccess);
    };

    return (
        <>
            <Heading level="1" size="xlarge" className={styles.tittel}>
                {formatMessage('gjenoppta.tittel')}
            </Heading>
            <Switch>
                <Route path={Routes.gjenopptaStansOppsummeringRoute.path}>
                    <GjenopptaOppsummering sak={props.sak} />
                </Route>
                <form className={styles.container} onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
                    <Controller
                        control={form.control}
                        name="årsak"
                        render={({ field, fieldState }) => (
                            <Select
                                error={fieldState.error?.message}
                                value={field.value ?? undefined}
                                onChange={field.onChange}
                                label={formatMessage('gjenoppta.årsak.tittel')}
                            >
                                <option>{formatMessage('gjenoppta.årsak.label')}</option>
                                <option value={OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING}>
                                    {formatMessage(OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING)}
                                </option>
                            </Select>
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
                    <div className={styles.knapper}>
                        <Button
                            variant="secondary"
                            onClick={() => history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))}
                        >
                            {formatMessage('gjenoppta.oppsummering.tilbake')}
                        </Button>
                        <Button variant="secondary">
                            {formatMessage('gjenoppta.oppsummering.iverksett')}
                            {RemoteData.isPending(gjenopptaStatus) && <Loader />}
                        </Button>
                    </div>
                </form>
            </Switch>
        </>
    );
};

export default Gjenoppta;
