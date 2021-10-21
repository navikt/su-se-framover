import * as RemoteData from '@devexperts/remote-data-ts';
import { Alert, Button, Link, Loader, Textarea } from '@navikt/ds-react';
import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useHistory } from 'react-router-dom';

import { AvslagManglendeDokType } from '~api/søknadApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import { avslagManglendeDokSøknad } from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { Sak } from '~types/Sak';

import nb from './lukkSøknad-nb';
import styles from './lukkSøknad.module.less';

interface Props {
    sak: Sak;
}

const AvslåttSøknad = (props: Props) => {
    const { control, handleSubmit } = useForm<AvslagManglendeDokType>();
    const urlParams = Routes.useRouteParams<typeof Routes.avsluttSøknadsbehandling>();
    const [apiStatus, setApiStatus] = useAsyncActionCreator(avslagManglendeDokSøknad);
    const søknad = props.sak.søknader.find((s) => s.id === urlParams.soknadId);
    const { formatMessage } = useI18n({ messages: nb });
    const history = useHistory();

    if (!søknad) {
        return (
            <div>
                <Alert variant="error">
                    {formatMessage('display.søknad.fantIkkeSøknad')} {urlParams.soknadId}
                </Alert>
            </div>
        );
    }

    const onSubmit = (data: AvslagManglendeDokType) => {
        setApiStatus(
            {
                søknadId: urlParams.soknadId,
                body: { fritekst: data.fritekst },
            },
            () => {
                const message = formatMessage('display.søknad.harBlittAvslått');
                return history.push(Routes.createSakIntroLocation(message, props.sak.id));
            }
        );
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className={styles.formContainer}>
            <div>
                <p>
                    {formatMessage('display.saksnummer')} {props.sak.saksnummer}
                </p>
                <p>
                    {formatMessage('display.søknadId')} {urlParams.soknadId}
                </p>
            </div>
            <div className={styles.avvistContainer}>
                <div className={styles.textAreaContainer}>
                    <Controller
                        name="fritekst"
                        control={control}
                        render={({ field }) => <Textarea {...field} label={formatMessage('display.avvist.fritekst')} />}
                    />
                </div>
                <Button variant="danger" className={styles.avvisButton} type="submit">
                    {formatMessage('knapp.avvis')}
                    {RemoteData.isPending(apiStatus) && <Loader />}
                </Button>
            </div>
            <div className={styles.tilbakeKnappContainer}>
                <Link href={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })}>
                    {formatMessage('knapp.tilbake')}
                </Link>
            </div>

            <div>{RemoteData.isFailure(apiStatus) && <ApiErrorAlert error={apiStatus.error} />}</div>
        </form>
    );
};

export default AvslåttSøknad;
