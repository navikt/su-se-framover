import * as RemoteData from '@devexperts/remote-data-ts';
import { Loader } from '@navikt/ds-react';
import { pipe } from 'fp-ts/lib/function';
import React, { useEffect } from 'react';

import { hentJournalposter } from '~src/api/sakApi';
import { useApiCall } from '~src/lib/hooks';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';
import OppsummeringAvJournalposter from '../oppsummering/journalpost/OppsummeringAvJournalposter';

const HentOgVisJournalposter = (props: { sakId: string }) => {
    const [journalposterStatus, hentJournalposterFor] = useApiCall(hentJournalposter);

    useEffect(() => {
        hentJournalposterFor({ sakId: props.sakId });
    }, []);

    return (
        <div>
            {pipe(
                journalposterStatus,
                RemoteData.fold(
                    () => null,
                    () => <Loader />,
                    (err) => <ApiErrorAlert error={err} />,
                    (journalposter) => <OppsummeringAvJournalposter journalposter={journalposter} />,
                ),
            )}
        </div>
    );
};

export default HentOgVisJournalposter;
