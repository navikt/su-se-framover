import { Input } from 'nav-frontend-skjema';
import React from 'react';

import * as personSlice from '~features/person/person.slice';
import * as sakSlice from '~features/saksoversikt/sak.slice';
import { useAppDispatch } from '~redux/Store';

const Søkefelt = (props: { onSakFetchSuccess: (id: string) => void }) => {
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
                    await dispatch(personSlice.fetchPerson({ fnr }));
                    const sakAction = await dispatch(sakSlice.fetchSak({ fnr }));
                    if (sakSlice.fetchSak.fulfilled.match(sakAction)) {
                        setFnr('');
                        props.onSuccess(sakAction.payload.id);
                    }
                }
            }}
            value={fnr}
            mini
        />
    );
};

export default Søkefelt;
