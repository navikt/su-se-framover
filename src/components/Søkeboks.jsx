import React, { useEffect, useRef, useState } from 'react';
import { useGet } from '../hooks/useGet';
import { useHistory } from 'react-router-dom';
import { Knapp } from 'nav-frontend-knapper';

function Søkeboks() {
    const identSearch = useRef(null);
    const fomDato = useRef(null);
    const tomDato = useRef(null);
    const [url, setUrl] = useState(undefined);
    const { data, isFetching } = useGet({ url });
    const history = useHistory();

    useEffect(() => {
        setUrl(undefined);
        if (data !== undefined) {
            if (data.fornavn) {
                history.push('/person', {
                    ident: identSearch.current.value,
                    fomDato: fomDato.current.value,
                    tomDato: tomDato.current.value,
                    data
                });
            } else {
                alert(`Kunne ikke finne noen person for fnr '${identSearch.current.value}'`);
            }
        }
    }, [data]);

    function search(value) {
        const searchUrl = '/person?ident=' + value;
        setUrl(searchUrl);
    }

    function keyTyped(e) {
        if (e.key === 'Enter') {
            search(identSearch.current.value);
        }
    }

    return (
        <>
            <input placeholder="FNR" ref={identSearch} type="text" onKeyDown={keyTyped} />
            <label style={{ marginLeft: '0.5em' }} htmlFor="fom">
                FOM:
            </label>
            <input
                type="date"
                id="fom"
                ref={fomDato}
                defaultValue={new Date(new Date(new Date().setMonth(-4)).setDate(1)).toISOString().slice(0, 10)}
            />
            <label style={{ marginLeft: '0.5em' }} htmlFor="tom">
                TOM:
            </label>
            <input type="date" id="tom" ref={tomDato} defaultValue={new Date().toISOString().slice(0, 10)} />
            <Knapp style={{ marginLeft: '1em' }} spinner={isFetching} onClick={() => search(identSearch.current.value)}>
                Søk
            </Knapp>
        </>
    );
}

export default Søkeboks;
