import React, { useState } from 'react';
import { Hovedknapp } from 'nav-frontend-knapper';
import AlertStripe from 'nav-frontend-alertstriper';
import { Undertittel } from 'nav-frontend-typografi';
import { validatePersonopplysninger } from './Personopplysninger';
import { validateBoforhold } from './Boforhold';
import { validateUtenlandsopphold } from './Utenlandsopphold';
import { validateOppholdstillatelse } from './Oppholdstillatelse';
import { validateInntektPensjonFormue } from './InntektPensjonFormue';
import { validateForNAV } from './ForNAV';
import DisplayDataFromApplic from '../../components/DisplayDataFromApplic';
import useFetch from '../../hooks/useFetch';

const OppsumeringOgSend = ({ state }) => {
    console.log(state);

    const [feilmeldinger, setFeilmeldinger] = useState([]);
    const [postData, setPostData] = useState({ url: undefined, method: 'post' });
    const { status, isFetching, failed } = useFetch(postData);

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
        setPostData({
            url: '/soknad',
            data: state,
            method: 'post'
        });
        if (errors.length < 1) {
            console.log('Sender søknad');
        } else {
            setFeilmeldinger(errors);
            console.log(errors);
        }
    }

    return (
        <div>
            <DisplayDataFromApplic state={state} />

            <p>------------------------------------------------------------</p>
            {feilmeldinger.length > 0 && SubmitFeilmeldinger(feilmeldinger)}
            <Hovedknapp onClick={sendSøknad} disabled={postData.url !== undefined} spinner={isFetching}>
                Send søknad
            </Hovedknapp>
            {(status === 201 && <Kvittering type={'suksess'} melding={'Søknad er sendt! Takk!'} />) ||
                (!isFetching && status === 401 && <Kvittering type="advarsel" melding="Du må logge inn på nytt!" />) ||
                (!isFetching && status > 400 && (
                    <Kvittering type="advarsel" melding="Det oppsto en feil under lagring" />
                )) ||
                (!isFetching && failed && <Kvittering type="advarsel" melding={failed} />)}
        </div>
    );
};

const SubmitFeilmeldinger = feilmeldinger => (
    <div className={'feiloppsummering'}>
        <Undertittel>Følgende feil ble funnet. Vennligst rett dem :)</Undertittel>
        <ul className="feiloppsummering__liste">
            {feilmeldinger.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

export default OppsumeringOgSend;
