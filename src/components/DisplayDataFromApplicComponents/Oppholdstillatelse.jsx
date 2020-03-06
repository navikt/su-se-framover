import { Undertittel } from 'nav-frontend-typografi';
import { jaNeiSpørsmål, reverseString } from './HelperFunctions';
import React from 'react';

const Oppholdstillatelse = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Opplysninger om oppholdstillatelse</Undertittel>

            <div style={sectionGridLayout}>
                <span>Har søker varig oppholdstillatelse:</span>
                <span>{jaNeiSpørsmål(state.oppholdstillatelse.harVarigOpphold)}</span>
            </div>

            <div style={sectionGridLayout}>
                {!state.oppholdstillatelse.harVarigOpphold && (
                    <>
                        <span>Utløpsdato: </span>
                        <span>{reverseString(state.oppholdstillatelse.utløpsDato)}</span>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                {!state.oppholdstillatelse.harVarigOpphold && (
                    <>
                        <span>Har søker søkt om forlengelse?</span>
                        <span>{jaNeiSpørsmål(state.oppholdstillatelse.søktOmForlengelse)}</span>
                    </>
                )}
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

export default Oppholdstillatelse;
