import React, { useState } from 'react';
import { Hovedknapp } from 'nav-frontend-knapper';
import AlertStripe from 'nav-frontend-alertstriper';
import { usePost } from '../../hooks/usePost';
import { Undertittel } from 'nav-frontend-typografi';
import { validatePersonopplysninger } from './Personopplysninger';
import { validateBoforhold } from './Boforhold';
import { validateUtenlandsopphold } from './Utenlandsopphold';
import { validateOppholdstillatelse } from './Oppholdstillatelse';
import { validateInntektPensjonFormue } from './InntektPensjonFormue';
import { validateForNAV } from './ForNAV';

const OppsumeringOgSend = ({ state, config }) => {
    const [feilmeldinger, setFeilmeldinger] = useState([]);
    const [postData, setPostData] = useState({ url: undefined });
    const { status, failed } = usePost(postData);

    const Kvittering = ({ type, melding }) => {
        return (
            <div style={{ margin: '0.5em 0', display: 'flex' }}>
                <AlertStripe type={type}>{melding}</AlertStripe>
            </div>
        );
    };

    function validerSøknad() {
        let errors = [];
        if (validatePersonopplysninger.validateFormValues(state.personopplysninger).length > 0) {
            errors.push('Det er feil i Personopplysninger (side 1)');
        }
        if (validateBoforhold.validateFormValues(state.boforhold).length > 0) {
            errors.push('Det er feil i Boforhold (side 2)');
        }
        if (validateUtenlandsopphold.validateFormValues(state.utenlandsopphold).length > 0) {
            errors.push('Det er feil i Utenlandsopphold (side 3)');
        }
        if (validateOppholdstillatelse.validateFormValues(state.oppholdstillatelse).length > 0) {
            errors.push('Det er feil i Oppholdstillatelse (side 4)');
        }

        if (validateInntektPensjonFormue.validateFormValues(state.inntektPensjonFormue).length > 0) {
            errors.push('Det er feil i Inntekt, pensjon, og formue (side 5)');
        }
        if (validateForNAV.validateFormValues(state.forNAV).length > 0) {
            errors.push('Det er feil i For NAV (side 6)');
        }
        return errors;
    }

    function sendSøknad() {
        console.log('state: ', state);

        const errors = validerSøknad();
        if (errors.length < 1) {
            console.log('Sender søknad');
            setPostData({
                url: config.suSeBakoverUrl + '/soknad',
                data: state
            });
        } else {
            setFeilmeldinger(errors);
            console.log(errors);
        }
    }

    return (
        <div>
            <p>Oppsumerings side</p>
            {feilmeldinger.length > 0 && SubmitFeilmeldinger(feilmeldinger)}
            <p>Trykk på send for å sende</p>
            <Hovedknapp onClick={sendSøknad} disabled={postData.url !== undefined}>
                Send søknad
            </Hovedknapp>
            {(status === 201 && <Kvittering type={'suksess'} melding={'Søknad er sent! Takk!'} />) ||
                (status === 401 && <Kvittering type="advarsel" melding="Du må logge inn på nytt!" />) ||
                (failed && <Kvittering type="advarsel" melding={failed} />)}
        </div>
    );
};

const SubmitFeilmeldinger = feilmeldinger => (
    <div className={'feiloppsummering'}>
        <Undertittel>Følgende feil ble funnet. Vennligst rett dem :)</Undertittel>
        <ul className="feiloppsummering__liste">
            {feilmeldinger.map(item => {
                return <li key={item}>{item}</li>;
            })}
        </ul>
    </div>
);

export default OppsumeringOgSend;
