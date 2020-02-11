import React, {useState} from "react";
import {Hovedknapp} from "nav-frontend-knapper";
import AlertStripe from 'nav-frontend-alertstriper';
import {usePost} from "../usePost";

const OppsumeringOgSend = ({state, config}) => {

    const [postData, setPostData] = useState({url: undefined})
    const {status, failed} = usePost(postData)

    const  Kvittering = ({type, melding}) => {
        return (
            <div style={{margin: '0.5em 0', display: 'flex'}}>
                <AlertStripe type={type}>{melding}</AlertStripe>
            </div>
        )
    }

    function sendSøknad(){
        console.log("Sender søknad")
        console.log(state)
        setPostData({url: config.suSeBakoverUrl+"/soknad", data: state})
    }

    return (
        <div>
            <p>Oppsumerings side</p>
            <p>Trykk på send for å sende</p>
            <Hovedknapp onClick={sendSøknad} disabled={postData.url !== undefined}>Send søknad</Hovedknapp>
            {
                status === 201 &&
                <Kvittering type={"suksess"} melding={"Søknad er sent! Takk!"}/> ||
                status === 401 &&
                <Kvittering type="advarsel" melding="Du må logge inn på nytt!" /> ||
                failed && <Kvittering type="advarsel" melding={failed} />
            }
        </div>
    )
}

export default OppsumeringOgSend


