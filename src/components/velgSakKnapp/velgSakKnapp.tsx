import * as RemoteData from '@devexperts/remote-data-ts';
import { Button } from '@navikt/ds-react';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import * as personSlice from '~src/features/person/person.slice';
import * as sakSlice from '~src/features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~src/lib/hooks';
import * as Routes from '~src/lib/routes';
import { useAppDispatch } from '~src/redux/Store';

import ApiErrorAlert from '../apiErrorAlert/ApiErrorAlert';

const VelgSakKnapp = (props: { label: string; saksnummer: string }) => {
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    return (
        <div>
            <Button
                variant="tertiary"
                onClick={async () => {
                    dispatch(personSlice.default.actions.resetSøkerData());
                    dispatch(sakSlice.default.actions.resetSak());
                    hentSak({ saksnummer: props.saksnummer }, (sak) => {
                        navigate(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }));
                    });
                }}
                loading={RemoteData.isPending(hentSakStatus)}
            >
                {props.label}
            </Button>
            {RemoteData.isFailure(hentSakStatus) && <ApiErrorAlert error={hentSakStatus.error} />}
        </div>
    );
};

export default VelgSakKnapp;
