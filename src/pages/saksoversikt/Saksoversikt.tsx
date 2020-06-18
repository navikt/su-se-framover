import React from 'react';
import { Input } from 'nav-frontend-skjema';
import apiClient from '~/api/apiClient';
import { Hovedknapp } from 'nav-frontend-knapper';

const Saksoversikt = () => {
    const [fnr, setFnr] = React.useState('');
    const [sak, setSak] = React.useState<unknown>();
    return (
        <div>
            {sak && JSON.stringify(sak)}

            <Input
                label={'fnr'}
                onChange={e => {
                    setFnr(e.target.value);
                }}
            />
            <Hovedknapp
                onClick={() => {
                    apiClient<unknown>(`/person/${fnr}/sak`, { method: 'GET' }).then(result => {
                        setSak(result.status === 'ok' ? result.data : '');
                    });
                }}
            >
                Hent sak
            </Hovedknapp>
        </div>
    );
};

export default Saksoversikt;
