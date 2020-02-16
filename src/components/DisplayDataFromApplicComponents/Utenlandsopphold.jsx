import {Undertittel} from "nav-frontend-typografi";
import React from "react";
import {reverseString} from "./HelperFunctions";

const Utenlandsopphold = ({state}) => {
    return (
        <div style={headerSpacing}>

            <Undertittel style={elementSpacing}>
                Utenlandsopphold
            </Undertittel>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.utenlandsopphold === 'true' && (
                    <>
                        <label>Utenlandsopphold:</label>
                        <label> {utenlandsopphold()}</label>
                    </>
                )}
            </div>

            <div style={sectionGridLayout}>
                {state.utenlandsopphold.planlagtUtenlandsopphold === 'true' && (
                    <>
                        <span>Planlagt utenlandsopphold:</span>
                        <span>{planlagtUtenlandsopphold()}</span>
                    </>
                )}
            </div>
        </div>
    );

    function utenlandsopphold() {
        const array = state.utenlandsopphold.utenlandsoppholdArray;
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
        const array = state.utenlandsopphold.planlagtUtenlandsoppholdArray;
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
}

const headerSpacing = {
    marginBottom: '2em'
}

const elementSpacing = {
    marginBottom: '1em'
}

export default Utenlandsopphold