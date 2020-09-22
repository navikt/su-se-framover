import { Input } from 'nav-frontend-skjema';
import React from 'react';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAppDispatch } from '~redux/Store';

const Søkefelt = () => {
    const dispatch = useAppDispatch();
    const [fnr, setFnr] = React.useState('');

    return (
        <Input
            name="fnr"
            placeholder="Fødselsnummer"
            maxLength={11}
            onChange={(e) => setFnr(e.target.value)}
            onKeyDown={async (e) => {
                if (e.keyCode === 13) {
                    dispatch(personSlice.fetchPerson({ fnr }));
                    dispatch(sakSlice.fetchSak({ fnr }));
                }
            }}
            value={fnr}
            mini
        />
    );
};

export default Søkefelt;
