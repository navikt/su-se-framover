import React, {useState} from "react";
import {Hovedknapp} from "nav-frontend-knapper";
import { AlertStripeSuksess } from 'nav-frontend-alertstriper';
import {usePost} from "../usePost";

const OppsumeringOgSend = ({state, config}) => {

    const [postData, setPostData] = useState({url: undefined})
    const {status, failed} = usePost(postData)

    const  Kvittering = () => {
        return (
            <div style={{margin: '0.5em 0', display: 'flex'}}>
                <AlertStripeSuksess type="suksess">Søknaden ble sendt. Takk!</AlertStripeSuksess>
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
            &nbsp;
            {
                status === 200 &&
                <Kvittering />
            }
            { failed && <p style={{marginTop: "1em"}}>{failed}</p> }
        </div>
    )
}


export default OppsumeringOgSend


