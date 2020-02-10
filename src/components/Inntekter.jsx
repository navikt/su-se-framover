import {Systemtittel, Undertittel} from "nav-frontend-typografi";
import Knapp from "nav-frontend-knapper";
import React, {useEffect} from "react";
import {InputFields} from "./FormElements";
import Lukknapp from 'nav-frontend-lukknapp';
import Lenke from "nav-frontend-lenker";

function Inntekter({state, setInntekter, errorsCollector}){
    useEffect(() => {
        if (errorsCollector !== undefined) {
            validateFormFields(errorsCollector)
        }
    }, [errorsCollector])

    const validateFormFields = errorsCollector => {
        state.inntekter.map((item, index) => {
            if (item.type.trim().length === 0) {
                errorsCollector.push({skjemaelementId: `${index}-type`, feilmelding: "Type kan ikke være tom"})
            }
            if (item.kilde.trim().length === 0) {
                errorsCollector.push({skjemaelementId: `${index}-kilde`, feilmelding: "Kilde kan ikke være tom"})
            }
        })
    }

    return (
        <>
            <div>
                <Systemtittel>Inntekt:</Systemtittel>
                {
                    state.inntekter.map((item, index)=> ({...item, key:index}))
                        .map((item, index) => {
                                return (
                                    <div key={item.key} style={DivInputFieldsWrapperStyle}>
                                        <InputFields id={`${item.key}-beløp`}labelText={"Beløp:"}  value={item.beløp}
                                                     onChange={(value) => updateBeløp(value, index)}/>

                                        <InputFields id={`${item.key}-type`} labelText={"Velg type:"} value={item.type}
                                                     onChange={(value) => updateType(value, index)}/>

                                        <InputFields id={`${item.key}-kilde`} labelText={"Kilde:"} value={item.kilde}
                                                     onChange={(value) => updateKilde(value,index)} />

                                        {
                                            state.inntekter.length > 1 &&
                                            <Lenke type="button" style={fjernInnputKnappStyle}

                                                   onClick={() => fjernValgtInputFelt(index)}>Fjern felt</Lenke>
                                        }
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
        </>
    )

    function addInntektsInput(){
        const values = [...state.inntekter]
        values.push({beløp:'', type:'', kilde:'' })
        setInntekter(values)
    }

    function fjernValgtInputFelt(index){
        const tempInntekter = [...state.inntekter.slice(0,index), ...state.inntekter.slice(index+1)]
        setInntekter(tempInntekter)
    }

    function updateBeløp(beløp, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.beløp = beløp

        const tempInntekter = [...state.inntekter.slice(0,index), inntekt, ...state.inntekter.slice(index+1)]
        setInntekter(tempInntekter)
    }

    function updateType(type, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.type = type

        const tempInntekter = [...state.inntekter.slice(0,index), inntekt, ...state.inntekter.slice(index+1)]
        setInntekter(tempInntekter)
    }

    function updateKilde(kilde, index){
        const inntekt = {...state.inntekter[index]}
        inntekt.kilde = kilde

        const tempInntekter = [...state.inntekter.slice(0,index), inntekt, ...state.inntekter.slice(index+1)]
        setInntekter(tempInntekter)
    }

    function adderInntekter(beløp){
        const reducer = (accumulator, currentValue) => accumulator + currentValue
        return beløp.reduce(reducer,0)
    }
}

const DivInputFieldsWrapperStyle = {
    display: 'flex',
}

const fjernInnputKnappStyle = {
    alignSelf: 'flex-end'
}



export default Inntekter