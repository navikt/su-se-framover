import { Systemtittel } from 'nav-frontend-typografi';
import React from 'react';
import Personopplysninger from './DisplayDataFromApplicComponents/Personopplysninger';
import Boforhold from './DisplayDataFromApplicComponents/Boforhold';
import Utenlandsopphold from './DisplayDataFromApplicComponents/Utenlandsopphold';
import Oppholdstillatelse from './DisplayDataFromApplicComponents/Oppholdstillatelse';
import InntektPensjonFormue from './DisplayDataFromApplicComponents/InntektPensjonFormue';
import ForNAV from './DisplayDataFromApplicComponents/ForNAV';

const DisplayDataFromApplic = ({ state }) => {
    console.log(state);
    if (Object.keys(state).length == 0) return null;
    return (
        <div>
            <Systemtittel style={{ marginBottom: '1em' }}>Oppsumerings side</Systemtittel>
            <Personopplysninger state={state} />
            <Boforhold state={state} />
            <Utenlandsopphold state={state} />
            <Oppholdstillatelse state={state} />
            <InntektPensjonFormue state={state} />
            <ForNAV state={state} />
        </div>
    );
};

export default DisplayDataFromApplic;
