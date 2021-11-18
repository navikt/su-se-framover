import * as RemoteData from '@devexperts/remote-data-ts';
import { yupResolver } from '@hookform/resolvers/yup';
import { Button, Ingress, Loader, TextField } from '@navikt/ds-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useHistory } from 'react-router';

import * as klageApi from '~api/klageApi';
import ApiErrorAlert from '~components/apiErrorAlert/ApiErrorAlert';
import LinkAsButton from '~components/linkAsButton/LinkAsButton';
import { useApiCall } from '~lib/hooks';
import { useI18n } from '~lib/i18n';
import * as Routes from '~lib/routes';
import { useRouteParams } from '~lib/routes';
import yup from '~lib/validering';

import messages from './klage-nb';
import styles from './klage.module.less';

interface FormData {
    journalpostId: string;
}
const schema = yup.object<FormData>({
    journalpostId: yup.string().trim().required(),
});

const OpprettKlage = () => {
    const urlParams = useRouteParams<typeof Routes.klageRoute>();
    const [opprettKlageStatus, opprettKlage] = useApiCall(klageApi.opprettKlage);
    const { handleSubmit, register, formState } = useForm<FormData>({
        resolver: yupResolver(schema),
        defaultValues: {
            journalpostId: '',
        },
    });
    const history = useHistory();
    const { formatMessage } = useI18n({ messages });

    return (
        <form
            className={styles.form}
            onSubmit={handleSubmit((values) =>
                opprettKlage(
                    {
                        sakId: urlParams.sakId,
                        journalpostId: values.journalpostId,
                    },
                    () => {
                        history.push(
                            Routes.createSakIntroLocation(
                                formatMessage('opprett.success.notification'),
                                urlParams.sakId
                            )
                        );
                    }
                )
            )}
        >
            <Ingress>{formatMessage('opprett.tittel')}</Ingress>
            <TextField
                {...register('journalpostId')}
                error={formState.errors.journalpostId?.message}
                label="JournalpostId"
            />
            <div className={styles.buttons}>
                <LinkAsButton
                    variant="secondary"
                    href={Routes.saksoversiktValgtSak.createURL({ sakId: urlParams.sakId })}
                >
                    {formatMessage('opprett.button.tilbake')}
                </LinkAsButton>
                <Button>
                    {formatMessage('opprett.button.submit')}
                    {RemoteData.isPending(opprettKlageStatus) && <Loader />}
                </Button>
            </div>
            {RemoteData.isFailure(opprettKlageStatus) && <ApiErrorAlert error={opprettKlageStatus.error} />}
        </form>
    );
};

export default OpprettKlage;
