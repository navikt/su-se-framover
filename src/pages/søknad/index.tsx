import * as React from 'react';
import { Input } from 'nav-frontend-skjema';
import { Knapp } from 'nav-frontend-knapper';
import { useAppDispatch } from '~redux/Store';

import * as saksoversiktSlice from '../../features/saksoversikt/saksoversikt.slice';

const index = () => {
    const [input, setInput] = React.useState('');
    const dispatch = useAppDispatch();

    return (
        <div>
            <Input onChange={e => setInput(e.target.value)} />
            <Knapp
                onClick={() => {
                    dispatch(saksoversiktSlice.fetchSøker({ fnr: input, access_token: '123' }));
                }}
            />
        </div>
    );
};

export default index;
