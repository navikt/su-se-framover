import { Input } from 'nav-frontend-skjema';
import React from 'react';
import { useHistory } from 'react-router-dom';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import * as Routes from '~lib/routes';
import { useAppDispatch } from '~redux/Store';

const Søkefelt = () => {
    const dispatch = useAppDispatch();
    const [fnr, setFnr] = React.useState('');
    const history = useHistory();

    return (
        <Input
            name="fnr"
            placeholder="Fødselsnummer"
            maxLength={11}
            onChange={(e) => setFnr(e.target.value)}
            onKeyDown={async (e) => {
                if (e.keyCode === 13) {
                    await dispatch(personSlice.fetchPerson({ fnr }));
                    const sakAction = await dispatch(sakSlice.fetchSak({ fnr }));
                    if (sakSlice.fetchSak.fulfilled.match(sakAction)) {
                        setFnr('');
                        history.push(
                            Routes.saksoversiktValgtSak.createURL({
                                sakId: sakAction.payload.id,
                            })
                        );
                    }
                }
            }}
            value={fnr}
            mini
        />
    );
};

export default Søkefelt;
