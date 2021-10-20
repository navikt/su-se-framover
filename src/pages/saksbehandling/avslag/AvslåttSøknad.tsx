import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Link, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { AvslagManglendeDokType } from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { avslagManglendeDokSøknad } from '~features/saksoversikt/sak.slice';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useAppDispatch, useAppSelector } from '~redux/Store';
import { Sak } from '~types/Sak';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';

interface Props {
    sak: Sak;
}

const AvslåttSøknad = (props: Props) => {
    const dispatch = useAppDispatch();
    const { control, handleSubmit } = useForm<AvslagManglendeDokType>();
    const { søknadLukketStatus, lukketSøknadBrevutkastStatus } = useAppSelector((s) => s.sak);
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);
    const { intl } = useI18n({ messages: nb });
    const history = useHistory();

    const status = RemoteData.combine(søknadLukketStatus, lukketSøknadBrevutkastStatus);
    const error = RemoteData.isFailure(status) ? status.error : undefined;

    if (!søknad) {
        return (
            <div>
                <Alert variant="error">
                    {intl.formatMessage({ id: 'display.søknad.fantIkkeSøknad' })} {urlParams.soknadId}
                </Alert>
            </div>
        );
    }

    const onSubmit = async (data: AvslagManglendeDokType) => {
        const response = await dispatch(
            avslagManglendeDokSøknad({
                søknadId: urlParams.soknadId,
                body: { fritekst: data.fritekst },
            })
        );

        if (avslagManglendeDokSøknad.fulfilled.match(response)) {
            const message = intl.formatMessage({ id: 'display.søknad.harBlittLukket' });
            history.push(Routes.createSakIntroLocation(message, props.sak.id));
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
            <div>
                <p>
                    {intl.formatMessage({ id: 'display.saksnummer' })} {props.sak.saksnummer}
                </p>
                <p>
                    {intl.formatMessage({ id: 'display.søknadId' })} {urlParams.soknadId}
                </p>
            </div>
            <div className={styles.avvistContainer}>
                <div className={styles.textAreaContainer}>
                    <Controller
                        name="fritekst"
                        control={control}
                        render={({ field }) => (
                            <Textarea {...field} label={intl.formatMessage({ id: 'display.avvist.fritekst' })} />
                        )}
                    />
                </div>
                <Button variant="danger" className={styles.avvisButton} type="submit">
                    {intl.formatMessage({ id: 'knapp.avvis' })}
                    {RemoteData.isPending(søknadLukketStatus) && <Loader />}
                </Button>
            </div>
            <div className={styles.tilbakeKnappContainer}>
                <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })}>
                    {intl.formatMessage({ id: 'knapp.tilbake' })}
                </Link>
            </div>

            <div>{error && <ApiErrorAlert error={error} />}</div>
        </form>
    );
};

export default AvslåttSøknad;
