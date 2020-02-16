import {Undertittel} from "nav-frontend-typografi";
import {jaNeiSpørsmål} from "./HelperFunctions";
import React from "react";

const ForNAV = ({state}) => {
    return (
        <div style={headerSpacing}>

            <Undertittel style={elementSpacing}>
                For NAV
            </Undertittel>
            <div style={sectionGridLayout}>
                <span>
                    Hvilket målform ønsker du svaret i?
                </span>
                <span>
                    {state.forNAV.maalform}
                </span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>
                    Har søker møtt personlig?
                </span>
                <span>
                    {jaNeiSpørsmål(state.forNAV.personligmote)}
                </span>
                <span style={elementSpacing}>
                    Har fullmektig møtt?
                </span>
                <span>
                    {jaNeiSpørsmål(state.forNAV.fullmektigmote)}
                </span>
                <span style={elementSpacing}>
                    Er originalt(e) pass sjekket for stempel?
                </span>
                <span>
                    {jaNeiSpørsmål(state.forNAV.passsjekk)}
                </span>
            </div>

            <div style={sectionGridLayout}>
                <span style={elementSpacing}>
                    {state.forNAV.forNAVmerknader !== undefined
                    && state.forNAV.forNAVmerknader.length > 0
                        ? <span>Merknader:</span>
                        : ''}
                </span>
                <span>
                    {state.forNAV.forNAVmerknader !== undefined
                    && state.forNAV.forNAVmerknader.length > 0
                        ? <span>{state.forNAV.forNAVmerknader}</span>
                        : ''}
                </span>
            </div>
        </div>
    );
};

const sectionGridLayout = {
    marginBottom: '1em',
    display: 'grid',
    gridTemplateColumns: '1fr 1fr'
}

const headerSpacing = {
    marginBottom: '2em'
}

const elementSpacing = {
    marginBottom: '1em'
}

export default ForNAV;