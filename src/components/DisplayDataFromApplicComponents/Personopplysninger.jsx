import { Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { jaNeiSpørsmål } from '../../HelperFunctions';

const Personopplysninger = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Personopplysninger</Undertittel>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Fødselsnummer:</span>
                <span>{state.personopplysninger.fnr}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Fornavn:</span>
                <span>{state.personopplysninger.fornavn}</span>
                <span style={elementSpacing}>Mellomnavn:</span>
                <span>{state.personopplysninger.mellomnavn}</span>
                <span style={elementSpacing}>Etternavn:</span>
                <span>{state.personopplysninger.etternavn}</span>
            </div>

            <div style={sectionGridLayout}>
                <span>Telefonnummer:</span>
                <span>{state.personopplysninger.telefonnummer}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Gateadresse:</span>
                <span>{state.personopplysninger.gateadresse}</span>
                <span>Bruksenhet:</span>
                <span>{state.personopplysninger.bruksenhet}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Postnummer:</span>
                <span>{state.personopplysninger.postnummer}</span>
                <span style={elementSpacing}>Poststed:</span>
                <span>{state.personopplysninger.poststed}</span>
                <span>Bokommune:</span>
                <span>{state.personopplysninger.bokommune}</span>
            </div>

            <div style={sectionGridLayout}>
                <span>Søkers statsborkerskap:</span>
                <span>{state.personopplysninger.statsborgerskap}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Er søker registrert som flyktning?</span>
                <span>{jaNeiSpørsmål(state.personopplysninger.flyktning)}</span>
                <span>Bor søker fast i Norge?</span>
                <span>{jaNeiSpørsmål(state.personopplysninger.borFastINorge)}</span>
            </div>
        </div>
    );
};

const sectionGridLayout = {
    marginBottom: '1em',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
};

const headerSpacing = {
    marginBottom: '2em'
};

const elementSpacing = {
    marginBottom: '1em'
};

export default Personopplysninger;
