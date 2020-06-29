import React from 'react';
import * as sakApi from 'api/sakApi';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory } from 'react-router-dom';

import * as behandlingSlice from '~features/saksoversikt/sak.slice';
import { useAppDispatch } from '~redux/Store';

const Sakintro = (props: { sak: sakApi.Sak }) => {
    const sakId = props.sak.id;
    const stønadsperiodeId = props.sak.stønadsperioder[0].id;
    const dispatch = useAppDispatch();
    const history = useHistory();

    return (
        <div>
            {JSON.stringify(props.sak, undefined, 4)}
            <Hovedknapp
                onClick={async () => {
                    await dispatch(behandlingSlice.startBehandling({ sakId, stønadsperiodeId }));
                    history.push('/saksoversikt/vilkar');
                }}
            >
                start behandlig
            </Hovedknapp>
        </div>
    );
};

export default Sakintro;
