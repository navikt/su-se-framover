import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Knapp } from 'nav-frontend-knapper';
import { Label, Select, Textarea } from 'nav-frontend-skjema';
import { Feilmelding, Innholdstittel } from 'nav-frontend-typografi';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Route, Switch, useHistory } from 'react-router';

import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import * as revurderingActions from '~features/revurdering/revurderingActions';
import sharedMessages from '~features/revurdering/sharedMessages-nb';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Nullable } from '~lib/types';
import yup from '~lib/validering';
import { OpprettetRevurderingGrunn, Revurdering } from '~types/Revurdering';
import { Sak } from '~types/Sak';
import { Gjenopptak } from '~types/Stans';
import { getRevurderingsårsakMessageId } from '~utils/revurdering/revurderingUtils';

import messages from './gjenoppta-nb';
import styles from './gjenoppta.module.less';
import GjenopptaOppsummering from './gjenopptaksoppsummering';

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
    const { intl } = useI18n({ messages: { ...messages, ...sharedMessages } });
    const history = useHistory();

    const revurdering = props.sak.revurderinger.find((r) => r.id === urlParams.revurderingId);
    const [gjenopptaStatus, gjenoppta] = useAsyncActionCreator(revurderingActions.gjenoppta);
    const [oppdaterStatus, oppdaterGjenopptak] = useAsyncActionCreator(revurderingActions.oppdaterGjenopptak);
    const status = RemoteData.combine(gjenopptaStatus, oppdaterStatus);

    const { ...form } = useForm<FormData>({
        defaultValues: hentDefaultVerdier(revurdering ?? null),
        resolver: yupResolver(
            yup.object<FormData>({
                begrunnelse: yup.string().required('Må fylles ut'),
                årsak: yup
                    .mixed()
                    .required()
                    .oneOf(
                        Object.values([OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING]),
                        'Må velge en gyldig årsak'
                    ),
            })
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
            <Innholdstittel className={styles.tittel}>{intl.formatMessage({ id: 'gjenoppta.tittel' })}</Innholdstittel>
            <Switch>
                <Route path={Routes.gjenopptaStansOppsummeringRoute.path}>
                    <GjenopptaOppsummering sak={props.sak} />
                </Route>
                <form onSubmit={form.handleSubmit((values) => handleSubmit(values))}>
                    <div className={styles.container}>
                        <div className={styles.select}>
                            <Label htmlFor="årsak"> {intl.formatMessage({ id: 'gjenoppta.årsak.tittel' })}</Label>
                            <Controller
                                control={form.control}
                                name="årsak"
                                render={({ field, fieldState }) => (
                                    <Select
                                        feil={
                                            fieldState.error && <Feilmelding> {fieldState.error.message} </Feilmelding>
                                        }
                                        value={field.value ?? undefined}
                                        onChange={field.onChange}
                                        className={styles.select}
                                    >
                                        <option>{intl.formatMessage({ id: 'gjenoppta.årsak.label' })}</option>
                                        <option value={OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING}>
                                            {intl.formatMessage({
                                                id: getRevurderingsårsakMessageId(
                                                    OpprettetRevurderingGrunn.MOTTATT_KONTROLLERKLÆRING
                                                ),
                                            })}
                                        </option>
                                    </Select>
                                )}
                            />
                        </div>

                        <div className={styles.begrunnelse}>
                            <Controller
                                control={form.control}
                                name="begrunnelse"
                                render={({ field, fieldState }) => (
                                    <Textarea
                                        label="Begrunnelse"
                                        name="begrunnelse"
                                        value={field.value}
                                        onChange={field.onChange}
                                        feil={fieldState.error}
                                    />
                                )}
                            />
                        </div>
                        {RemoteData.isFailure(status) && (
                            <div className={styles.error}>
                                <ApiErrorAlert error={status.error} />
                            </div>
                        )}
                        <div className={styles.knapper}>
                            <Knapp
                                htmlType="button"
                                onClick={() =>
                                    history.push(Routes.saksoversiktValgtSak.createURL({ sakId: props.sak.id }))
                                }
                            >
                                {intl.formatMessage({ id: 'gjenoppta.oppsummering.tilbake' })}
                            </Knapp>
                            <Knapp spinner={RemoteData.isPending(gjenopptaStatus)}>
                                {intl.formatMessage({ id: 'gjenoppta.oppsummering.iverksett' })}
                            </Knapp>
                        </div>
                    </div>
                </form>
            </Switch>
        </>
    );
};

export default Gjenoppta;
