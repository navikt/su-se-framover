import { Undertittel } from 'nav-frontend-typografi';
import { jaNeiSpørsmål } from '../../HelperFunctions';
import React from 'react';

const ForNAV = ({ state }) => {
    console.log(state);
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>For NAV</Undertittel>
            <div style={sectionGridLayout}>
                <span>Hvilket målform ønsker du svaret i?</span>
                <span>{state.forNav.målform}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>Har søker møtt personlig?</span>
                <span>{jaNeiSpørsmål(state.forNav.søkerMøttPersonlig)}</span>
                <span style={elementSpacing}>Har fullmektig møtt?</span>
                <span>{jaNeiSpørsmål(state.forNav.harFullmektigMøtt)}</span>
                <span style={elementSpacing}>Er originalt(e) pass sjekket for stempel?</span>
                <span>{jaNeiSpørsmål(state.forNav.erPassSjekket)}</span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>
                    {state.forNav.merknader !== undefined && state.forNav.merknader.length > 0 ? (
                        <span>Merknader:</span>
                    ) : (
                        ''
                    )}
                </span>
                <span>
                    {state.forNav.merknader !== undefined && state.forNav.merknader.length > 0 ? (
                        <span>{state.forNav.merknader}</span>
                    ) : (
                        ''
                    )}
                </span>
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

export default ForNAV;
