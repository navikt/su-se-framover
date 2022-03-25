import * as RemoteData from '@devexperts/remote-data-ts';
import { Button, Loader } from '@navikt/ds-react';
import React from 'react';
import { useHistory } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAsyncActionCreator } from '~lib/hooks';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';

const VelgSakKnapp = (props: { label: string; saksnummer: string }) => {
    const [hentSakStatus, hentSak] = useAsyncActionCreator(sakSlice.fetchSak);
    const { push } = useHistory();
    const dispatch = useAppDispatch();

    return (
        <Button
            variant="tertiary"
            onClick={async () => {
                dispatch(personSlice.default.actions.resetSøker());
                dispatch(sakSlice.default.actions.resetSak());
                hentSak({ saksnummer: props.saksnummer }, (sak) => {
                    push(Routes.saksoversiktValgtSak.createURL({ sakId: sak.id }));
                });
            }}
        >
            {props.label}
            {RemoteData.isPending(hentSakStatus) && <Loader />}
        </Button>
    );
};

export default VelgSakKnapp;
