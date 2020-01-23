import React, {useRef, useState} from "react";
import {Sidetittel, Systemtittel} from "nav-frontend-typografi";
import { Panel } from 'nav-frontend-paneler';
import {Label, Input, TextareaControlled} from 'nav-frontend-skjema';
import Knapp from 'nav-frontend-knapper';
import EtikettAdvarsel from 'nav-frontend-etiketter';


function Beregning(){
    const [state, setState] = useState({})


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

    return (
        <div>
            <Sidetittel style={BeregningTittelStyle}>Beregning</Sidetittel>
            <EtikettAdvarsel style={buttonPositonStyle} type="advarsel">ADVARSEL - EKSPERIMENTELT DESIGN - IKKE REPRESENTATIVT FOR ENDELIG UTSEENDE</EtikettAdvarsel>

            <form onSubmit={handleSubmit}>
                <Panel border>
                    <div>
                        <Systemtittel>Periode:</Systemtittel>
                        <div style={DivInputFieldsWrapperStyle}>
                            <InputFields labelText={"Fra måned"}/>
                            <InputFields labelText={"Til måned"}/>
                        </div>
                    </div>

                    <div>
                        <Systemtittel>Sats:</Systemtittel>
                        <div>
                            <InputFieldWithText text={"kr"} value={state.sats} onChange={setSats}/>
                            <TextareaControlled label="Begrunnelse:" onChange={setBegrunnelse}/>
                        </div>
                    </div>


                    <div>
                        <Systemtittel>Inntekt:</Systemtittel>
                        <div style={DivInputFieldsWrapperStyle}>
                            <InputFields labelText={"Beløp:"} />
                            <InputFields labelText={"Velg type"}/>
                            <InputFields labelText={"Kilde"}/>
                        </div>
                    </div>

                    <div>
                        <br/>
                        <Knapp htmlType="button" onClick={IClickedButton}>Legg til</Knapp>
                    </div>
                </Panel>
                <div style={buttonPositonStyle}>
                    <Knapp htmlType="submit">Lagre</Knapp>
                </div>
            </form>
        </div>
    )

    function IClickedButton(){
        console.log("Legger til")
    }

    function handleSubmit(event){
        event.preventDefault()
        console.log("submitting")
        const formValues = state
        console.log(formValues)
    }


    function InputFieldWithText({text, value, onChange}){
        return (
            <div style={{'display':'flex', 'alignItems': 'center'}}>
            <Input id="min-input-2" value={value} onChange={(e => onChange(e.target.value))}/>
            <div style={{'flexGrow':1}}>
                <Label htmlFor="min-input-2" style={{'margin':0, 'marginRight':'1rem'}}>{text}</Label>
            </div>
        </div>
        )
    }


    function InputFields({labelText}){
            return (
                <span style={InputFieldsStyle}>
                    <Input label={labelText} />
                </span>
            )
    }

}

const DivInputFieldsWrapperStyle = {
    display: 'flex'
}

const InputFieldsStyle = {
    marginRight: '1em'
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