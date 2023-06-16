import * as RemoteData from '@devexperts/remote-data-ts';
import { Heading, Loader } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import { hentJournalposter } from '~src/api/sakApi';
import { useApiCall } from '~src/lib/hooks';
import { useI18n } from '~src/lib/i18n';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import OppsummeringAvJournalposter from '../oppsummering/journalpost/OppsummeringAvJournalposter';

import messages from './HentOgVisJournalposter-nb';

const HentOgVisJournalposter = (props: { sakId: string }) => {
    const { formatMessage } = useI18n({ messages });
    const [journalposterStatus, hentJournalposterFor] = useApiCall(hentJournalposter);

    useEffect(() => {
        hentJournalposterFor({ sakId: props.sakId });
    }, []);

    return (
        <div>
            <Heading level="2" size="medium">
                {formatMessage('journalposter.tittel')}
            </Heading>
            {pipe(
                journalposterStatus,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => <ApiErrorAlert error={err} />,
                    (journalposter) => <OppsummeringAvJournalposter journalposter={journalposter} />
                )
            )}
        </div>
    );
};

export default HentOgVisJournalposter;
