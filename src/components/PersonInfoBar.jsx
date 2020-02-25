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
        <div>
            <CollapsiblePanel
                navn={'Planet Planetus Planetetus'}
                alder={'56'}
                fødselsnummer={'12345678901'}
                infoTexts={'jeg er ekstra tekst. jeg bruker masse plass her. klikk på meg for å se mer'}
                etikett={['hjelp meg', 'jeg dør snart', 'ikke la barna mine ta formuen min']}
            />
        </div>
    );
}

export default PersonInfoBar;
