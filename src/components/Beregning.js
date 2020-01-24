import React, {useState} from "react";
import {Sidetittel, Systemtittel, Undertittel} from "nav-frontend-typografi";
import { Panel } from 'nav-frontend-paneler';
import {Label, Input, Textarea} from 'nav-frontend-skjema';
import Knapp from 'nav-frontend-knapper';
import EtikettAdvarsel from 'nav-frontend-etiketter';


function Beregning(){
    const [state, setState] = useState({fraMåned:'', tilMåned:'', sats: '',
        begrunnelse: '', inntekter:[{beløp:'', type:'', kilde:''}]})

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

    function addInntektsInput(){
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

    function updateType(type, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.type = type

        const tempInntekter = [...state.inntekter.slice(0,index), inntekt, ...state.inntekter.slice(index+1)]
        setState((state) =>{
            return {...state, inntekter: tempInntekter}
        })
    }

    function updateKilde(kilde, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.kilde = kilde

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
                            <InputFields labelText={"Fra måned"} value={state.fraMåned} onChange={setFraMåned}/>
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

                                                        <InputFields labelText={"Velg type:"} value={item.type}
                                                                     onChange={(value) => updateType(value, index)}/>

                                                        <InputFields labelText={"Kilde:"} value={item.kilde}
                                                                     onChange={(value) => updateKilde(value,index)} />
                                                    </div>

                                                )
                                            }
                                        )
                        }

                    </div>
                    <div>
                        <br/>
                        <Knapp htmlType="button" onClick={addInntektsInput}>Legg til</Knapp>
                    </div>
                    <div>
                        <br/>
                        <Undertittel>Sum Inntekt: {
                            adderInntekter(state.inntekter
                                .map(item => parseInt(item.beløp,10))
                                .filter(item => ! isNaN(item))
                            )
                        }
                        </Undertittel>
                    </div>

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
    }

}


function adderInntekter(beløp){
    const reducer = (accumulator, currentValue) => accumulator + currentValue
    return beløp.reduce(reducer,0)
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