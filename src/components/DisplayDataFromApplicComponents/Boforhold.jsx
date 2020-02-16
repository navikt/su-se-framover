import { Undertittel } from 'nav-frontend-typografi';
import { jaNeiSpørsmål } from './HelperFunctions';
import React from 'react';

const Boforhold = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Boforhold</Undertittel>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Deler søker bolig med en annen voksen?</span>
                <span>{jaNeiSpørsmål(state.boforhold.delerDuBolig)}</span>
            </div>

            <div style={sectionGridLayout}>
                {state.boforhold.borSammenMed.length > 0 && (
                    <>
                        <span>Søker deler bolig med:</span>
                        <span>{borSammenMed()}</span>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                {state.boforhold.delerDuBolig === 'true' && (
                    <>
                        <span>Opplysninger:</span>
                        <span>{opplysningerOmAnnenVoksen()}</span>
                    </>
                )}
            </div>
        </div>
    );

    function borSammenMed() {
        const array = state.boforhold.borSammenMed;
        let string = '';
        for (let i = 0; i < array.length; i++) {
            if (i === array.length - 1) {
                array[i] === 'esp' ? (string += 'Ektefelle/Samboer/Partner') : (string += '');
                array[i] === 'over18' ? (string += 'Barn over 18') : (string += '');
                array[i] === 'annenPerson' ? (string += 'Andre personer over 18') : (string += '');
            } else {
                array[i] === 'esp' ? (string += 'Ektefelle/Samboer/Partner, ') : (string += '');
                array[i] === 'over18' ? (string += 'Barn over 18, ') : (string += '');
                array[i] === 'annenPerson' ? (string += 'Andre personer over 18, ') : (string += '');
            }
        }
        return string;
    }

    function opplysningerOmAnnenVoksen() {
        const array = state.boforhold.delerBoligMed;
        return (
            <ol>
                {array.map((person, index) => (
                    <li style={elementSpacing} key={index}>
                        {index + 1}. Fødselsnummer: {person.fødselsnummer}, Navn: {person.navn}
                    </li>
                ))}
            </ol>
        );
    }
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

export default Boforhold;
