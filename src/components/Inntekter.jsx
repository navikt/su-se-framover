import {Systemtittel, Undertittel} from "nav-frontend-typografi";
import Knapp from "nav-frontend-knapper";
import React from "react";
import {InputFields} from "./FormElements";


function Inntekter({state, setInntekter}){
    return (
        <>
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
        </>
    )

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
    display: 'flex'
}



export default Inntekter