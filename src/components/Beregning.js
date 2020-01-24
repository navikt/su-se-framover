import React, {useState} from "react";
import {Sidetittel, Systemtittel} from "nav-frontend-typografi";
import { Panel } from 'nav-frontend-paneler';
import {Label, Input, Textarea} from 'nav-frontend-skjema';
import Knapp from 'nav-frontend-knapper';
import EtikettAdvarsel from 'nav-frontend-etiketter';


function Beregning(){
    const [state, setState] = useState({sats: '', begrunnelse: '', inntekter:[{beløp:'', type:'', kilde:''}]})

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

    function IClickedButton(){
        console.log("Legger til")
        const values = [...state.inntekter]
        values.push({beløp:'', type:'', kilde:'' })
        setInntekter(values)
    }

    function updateBeløp(beløp, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.beløp = beløp

        const tempInntekter = [...state.inntekter.slice(0,index), inntekt, ...state.inntekter.slice(index+1)]
        setState((state) =>{
            return {...state, inntekter: tempInntekter}
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
                            <Textarea label={"Begrunnelse:"} value={state.begrunnelse} onChange={e => setBegrunnelse(e.target.value)}/>
                        </div>
                    </div>

                    <div>
                        <Systemtittel>Inntekt:</Systemtittel>
                        {
                            state.inntekter.map((item, index)=> ({...item, key:index}))
                                            .map((item, index) => {
                                                console.log(item)
                                                return (
                                                    <div key={item.key} style={DivInputFieldsWrapperStyle}>
                                                        <InputFields labelText={"Beløp:"}  value={item.beløp}
                                                                     onChange={(value) => updateBeløp(value, index)}/>
                                                        <InputFields labelText={"Velg type:"} value={item.type} />
                                                        <InputFields labelText={"Kilde:"} value={item.kilde} />
                                                    </div>

                                                )
                                            }
                                        )
                        }

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



    function handleSubmit(event){
        event.preventDefault()
        console.log("submitting")
        const formValues = state
        console.log(formValues)
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


function InputFields({labelText, value, onChange}){
    return (
        <span style={InputFieldsStyle}>
            <Input label={labelText} value={value} onChange={(e => onChange(e.target.value))}/>
        </span>
    )
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