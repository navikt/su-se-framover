import React from 'react';
import useFetch from '../hooks/useFetch';
import { CollapsiblePanel } from './FormElements';

function PersonInfoBar({ fnr }) {
    const url = '/person?ident=' + fnr;
    const { data } = useFetch({ url });
    //eslint-disable-next-line
    const person = data ? data : {};
    // console.log('person', person);
    return (
        <CollapsiblePanel
            navn={'Planet Planetus Planetetus'}
            alder={'56'}
            fødselsnummer={'12345678901'}
            infoTexts={'klikk på meg for å se mer'}
            etikett={['Info', 'mer info', 'enda mer info']}
        />
    );
}

export default PersonInfoBar;
