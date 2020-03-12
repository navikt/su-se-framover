import { Undertittel } from 'nav-frontend-typografi';
import { jaNeiSpørsmål } from '../../HelperFunctions';
import React from 'react';

const Boforhold = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Boforhold</Undertittel>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Deler søker bolig med en annen voksen?</span>
                <span>{jaNeiSpørsmål(state.boforhold.delerBolig)}</span>
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
                {state.boforhold.delerBolig && (
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
                array[i] === 'Ektefelle/Partner/Samboer' ? (string += 'Ektefelle/Samboer/Partner') : (string += '');
                array[i] === 'Barn over 18' ? (string += 'Barn over 18') : (string += '');
                array[i] === 'Andre personer over 18 år' ? (string += 'Andre personer over 18') : (string += '');
            } else {
                array[i] === 'Ektefelle/Partner/Samboer' ? (string += 'Ektefelle/Samboer/Partner, ') : (string += '');
                array[i] === 'Barn over 18' ? (string += 'Barn over 18, ') : (string += '');
                array[i] === 'Andre personer over 18 år' ? (string += 'Andre personer over 18, ') : (string += '');
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
                        {person.fnr} {person.navn}
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
