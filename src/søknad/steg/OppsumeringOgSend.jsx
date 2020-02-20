import React, { useEffect, useState } from 'react';
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
import { useHistory } from 'react-router-dom';
import { getNorwegianNationalFlag, getRandomSmiley } from '../../hooks/getRandomEmoji';

const OppsumeringOgSend = ({ state, disableStegIndikator }) => {
    console.log(state);

    const [feilmeldinger, setFeilmeldinger] = useState([]);
    const [postData, setPostData] = useState({ url: undefined, method: 'post' });
    let { status, isFetching, failed } = useFetch(postData);
    const history = useHistory();

    const trimEndsOfState = state => {
        if (!Array.isArray(state) && typeof state != 'object') return state;
        return Object.keys(state).reduce(
            function(acc, key) {
                acc[key.trim()] = typeof state[key] == 'string' ? state[key].trim() : trimEndsOfState(state[key]);
                return acc;
            },
            Array.isArray(state) ? [] : {}
        );
    };

    state = trimEndsOfState(state);
    console.log('aftrer trimming: ', state);

    const Kvittering = ({ type, melding }) => {
        return (
            <div style={{ margin: '0.5em 0', display: 'flex' }}>
                <AlertStripe type={type}>{melding}</AlertStripe>
            </div>
        );
    };

    useEffect(() => {
        if (status === 201 && status !== undefined) {
            setTimeout(() => {
                history.push('/');
            }, 5000);
        }
    }, [status]);

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
                url: '/soknad',
                data: state,
                method: 'post'
            });
        } else {
            setFeilmeldinger(errors);
            console.log(errors);
        }
    }

    return (
        <div>
            <DisplayDataFromApplic state={state} />

            {feilmeldinger.length > 0 && SubmitFeilmeldinger(feilmeldinger)}
            <Hovedknapp onClick={sendSøknad} disabled={postData.url !== undefined} spinner={isFetching}>
                Send søknad
            </Hovedknapp>

            {(status === 201 &&
                (disableStegIndikator(),
                (
                    <Kvittering
                        type={'suksess'}
                        melding={`Søknad er sendt! Takk! ${getRandomSmiley()} 
                                                      ${getNorwegianNationalFlag()}`}
                    />
                ))) ||
                (!isFetching && status === 401 && <Kvittering type="advarsel" melding="Du må logge inn på nytt!" />) ||
                (!isFetching && status === 400 && (
                    <Kvittering type="advarsel" melding="Det har blitt opgitt feil info. se gjennom søknad" />
                )) ||
                (!isFetching && status > 400 && (
                    <Kvittering type="advarsel" melding="Det oppsto en feil under sending. Prøv igjen senere" />
                )) ||
                (!isFetching && failed && <Kvittering type="advarsel" melding={failed} />)}
        </div>
    );
};

const SubmitFeilmeldinger = feilmeldinger => (
    <div className={'feiloppsummering'}>
        <Undertittel>Følgende feil ble funnet. Vennligst rett dem {getRandomSmiley()}</Undertittel>
        <ul className="feiloppsummering__liste">
            {feilmeldinger.map(item => (
                <li key={item}>{item}</li>
            ))}
        </ul>
    </div>
);

export default OppsumeringOgSend;
