import { Undertittel } from 'nav-frontend-typografi';
import React from 'react';
import { reverseString } from '../../HelperFunctions';
import { jaNeiSpørsmål } from '../../HelperFunctions';

const Utenlandsopphold = ({ state }) => {
    return (
        <div style={headerSpacing}>
            <Undertittel style={elementSpacing}>Utenlandsopphold</Undertittel>

            <div style={sectionGridLayout}>
                <span>Registrert utenlandsopphold:</span>
                <span>{jaNeiSpørsmål(state.utenlandsopphold.utenlandsopphold)}</span>
            </div>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.utenlandsopphold && (
                    <>
                        <label>Utenlandsopphold:</label>
                        <label> {utenlandsopphold()}</label>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.utenlandsopphold && (
                    <>
                        <label style={{ marginBottom: '1em' }}>Antall registrerte dager:</label>
                        <label> {state.utenlandsopphold.antallRegistrerteDager}</label>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                <span>Planlagt utenlandsopphold:</span>
                <span>{jaNeiSpørsmål(state.utenlandsopphold.planlagtUtenlandsopphold)}</span>
            </div>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.planlagtUtenlandsopphold && (
                    <>
                        <span>Planlagt utenlandsopphold:</span>
                        <span>{planlagtUtenlandsopphold()}</span>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.planlagtUtenlandsopphold && (
                    <>
                        <label style={{ marginBottom: '1em' }}>Antall registrerte dager:</label>
                        <label> {state.utenlandsopphold.antallPlanlagteDager}</label>
                    </>
                )}
            </div>
        </div>
    );

    function utenlandsopphold() {
        const array = state.utenlandsopphold.registrertePerioder;
        return (
            <ol>
                {array.map((utenlandsoppholdRow, index) => (
                    <li style={elementSpacing} key={index}>
                        {reverseString(utenlandsoppholdRow.utreisedato)}&nbsp;- &nbsp;
                        {reverseString(utenlandsoppholdRow.innreisedato)}
                    </li>
                ))}
            </ol>
        );
    }

    function planlagtUtenlandsopphold() {
        const array = state.utenlandsopphold.planlagtePerioder;
        return (
            <ol>
                {array.map((utenlandsoppholdRow, index) => (
                    <li style={elementSpacing} key={index}>
                        {reverseString(utenlandsoppholdRow.utreisedato)}&nbsp;- &nbsp;
                        {reverseString(utenlandsoppholdRow.innreisedato)}
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

export default Utenlandsopphold;
