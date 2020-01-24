import React, {useState} from "react";
import {Sidetittel, Systemtittel, Undertittel} from "nav-frontend-typografi";
import { Panel } from 'nav-frontend-paneler';
import {Label, Input, Textarea, Feiloppsummering} from 'nav-frontend-skjema';
import Knapp from 'nav-frontend-knapper';
import EtikettAdvarsel from 'nav-frontend-etiketter';
import Inntekter from "./Inntekter";
import {InputFields} from "./FormElements";


function Beregning(){
    const [state, setState] = useState({fraMåned:'', tilMåned:'', sats: '',
        begrunnelse: '', inntekter:[{beløp:'', type:'', kilde:''}]})

    const [validationErrors, setValidationErrors] = useState([])

    const fields = {fraMåned: {label: "Fra måned", htmlId:"fra-måned"}}


    function setFraMåned(fraMåned){
        setState((state) =>{
            return {...state, fraMåned}
        })
    }

    function setTilMåned(tilMåned){
        setState((state) =>{
            return {...state, tilMåned}
        })
    }

    function setSats(sats){
        setState((state) =>{
            return {...state, sats}
        })
    }

    function setBegrunnelse(begrunnelse){
        setState((state) =>{
            return {...state, begrunnelse}
        })
    }

    function setInntekter(inntekter){
        setState((state) =>{
            return {...state, inntekter}
        })
    }

    return (
        <div>
            <Sidetittel style={BeregningTittelStyle}>Beregning</Sidetittel>
            <EtikettAdvarsel style={buttonPositonStyle} type="advarsel">ADVARSEL - EKSPERIMENTELT DESIGN - IKKE REPRESENTATIVT FOR ENDELIG UTSEENDE</EtikettAdvarsel>

            <form onSubmit={handleSubmit}>
                <Panel border>
                    <div>
                        <Systemtittel>Periode:</Systemtittel>
                        <div style={DivInputFieldsWrapperStyle}>
                            <InputFields labelText={fields.fraMåned.label} id={fields.fraMåned.htmlId}
                                         value={state.fraMåned} onChange={setFraMåned}/>
                            <InputFields labelText={"Til måned"} value={state.tilMåned} onChange={setTilMåned}/>
                        </div>
                    </div>

                    <div>
                        <Systemtittel>Sats:</Systemtittel>
                        <div>
                            <InputFieldWithText text={"kr"} value={state.sats} onChange={setSats}/>
                            <Textarea label={"Begrunnelse:"} value={state.begrunnelse} onChange={e => setBegrunnelse(e.target.value)}/>
                        </div>
                    </div>

                    <Inntekter state={state} setState={setState} setInntekter={setInntekter} />
                        {
                            validationErrors.length > 0 && <Feiloppsummering tittel={"Du har feil"} feil={validationErrors} />

                        }

                </Panel>

                <div style={buttonPositonStyle}>
                    <Knapp htmlType="submit">Lagre</Knapp>
                    <Knapp >Neste</Knapp>
                </div>
            </form>
        </div>
    )

    function handleSubmit(event){
        event.preventDefault()
        console.log("submitting")
        const formValues = state
        console.log(formValues)

         validateFormValues(formValues)


    }

    function validateFormValues(formValues){
        const fraMåned = formValues.fraMåned
        const errors = []
        if (!/^\d{2}\/\d{2}$/.test(fraMåned)){
            errors.push({skjemaelementId: fields.fraMåned.htmlId, feilmelding: "Fra måned følger ikke formen xx/xx"})
        } else {
            if (parseInt(fraMåned.substring(0,2),10) > 12 ) {
                errors.push({skjemaelementId: fields.fraMåned.htmlId, feilmelding:"Måned må være mindre enn 12"})
            }
            if (parseInt(fraMåned.substring(3, 5), 10) <19){
                errors.push({skjemaelementId: fields.fraMåned.htmlId, feilmelding: "År må være høyere enn 19"})
            }
        }
        setValidationErrors(errors)
    }

}

function InputFieldWithText({text, value, onChange}){
    const divStyle = {
        display:'flex',
        alignItems: 'center'
    }
    const innerDivstyle = {
        flexGrow:'1'
    }
    const labelStyle = {
        margin: '0',
        marginRight:'1rem'
    }

    return (
        <div style={divStyle}>
            <Input value={value} onChange={(e => onChange(e.target.value))}/>
            <div style={innerDivstyle}>
                <Label style={labelStyle}>{text}</Label>
            </div>
        </div>
    )
}

const DivInputFieldsWrapperStyle = {
    display: 'flex'
}

const BeregningTittelStyle = {
    display: 'flex',
    justifyContent: 'center'
}

const buttonPositonStyle = {
    display: 'flex',
    justifyContent: 'center'
}


export default Beregning;