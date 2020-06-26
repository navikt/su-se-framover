import React from 'react';
import { useHistory } from 'react-router-dom';
import { Input } from 'nav-frontend-skjema';

import { useAppDispatch } from '~redux/Store';
import * as personSlice from '~features/person/person.slice';

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
            onKeyDown={(e) => {
                if (e.keyCode === 13) {
                    dispatch(personSlice.fetchPerson({ fnr }));
                    setFnr('');
                    history.push('/saksoversikt');
                }
            }}
            value={fnr}
            mini
        />
    );
};

export default Søkefelt;
