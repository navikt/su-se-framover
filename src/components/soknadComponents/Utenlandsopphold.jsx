import React from 'react'
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";
import {Systemtittel} from "nav-frontend-typografi";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';


const Utenlandsopphold = ({state, updateFieldInState, onClick}) =>{

    function addInputFields(){
        const values = state.utenlandsoppholdArray
        values.push({utreisedato:'', innreisedato:''})
        updateFieldInState("utenlandsoppholdArray", values)
    }

    function utenlandsoppholdUtreisedato(dato, index){
        const utenlandsopphold = {...state.utenlandsoppholdArray[index]}
        utenlandsopphold.utreisedato = dato

        const tempUtreiseDato = [...state.utenlandsoppholdArray.slice(0,index), utenlandsopphold, ...state.utenlandsoppholdArray.slice(index+1)]
        updateFieldInState("utenlandsoppholdArray", tempUtreiseDato)
    }

    function utenlandsoppholdInnreisedato(dato, index){
        const utenlandsopphold = {...state.utenlandsoppholdArray[index]}
        utenlandsopphold.innreisedato = dato

        const tempInnreiseDato = [...state.utenlandsoppholdArray.slice(0,index), utenlandsopphold, ...state.utenlandsoppholdArray.slice(index+1)]
        updateFieldInState("utenlandsoppholdArray", tempInnreiseDato)
    }


    function fjernValgtInputFelt(state, field, index){
        const tempField = [...state.slice(0,index), ...state.slice(index+1)]
        updateFieldInState(field, tempField)
    }

    function utenlandsoppholdFelter(){
        if(state.utenlandsopphold === "true"){

            return (
                <div>
                    <div>
                        {
                            state.utenlandsoppholdArray.map((item, index) => ({...item, key: index}))
                                .map((item, index) => {
                                        return (
                                            <div key={item.key} style={container}>

                                                <InputFields id={`${item.key}-utreisedato`}
                                                             labelText={"Utreisedato"}
                                                             value={item.utreisedato}
                                                             onChange={(value) => utenlandsoppholdUtreisedato(value, index)}
                                                />

                                                <InputFields id={`${item.key}-innreisedato`}
                                                             labelText={"Innreisedato"}
                                                             value={item.innreisedato}
                                                             onChange={(value) => utenlandsoppholdInnreisedato(value, index)}
                                                />

                                                <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                          onClick={() => fjernValgtInputFelt(state.utenlandsoppholdArray, "utenlandsoppholdArray", index)}>Lukk</Lukknapp>
                                            </div>
                                        )
                                    }
                                )
                        }
                    </div>
                    <Knapp onClick={() => addInputFields(state.utenlandsoppholdArray)}>Legg til flere utenlandsopphold</Knapp>
                </div>
            )
        }
    }

//--------------------Planlagt utenlandsopphold ------------------------------
    function addInputFieldsPlantlagt(){
        const values = state.PlanlagtUtenlandsoppholdArray
        values.push({planlagtUtreisedato:'', planlagtInnreisedato:''})
        updateFieldInState("PlanlagtUtenlandsoppholdArray", values)
    }

    function planlagtUtenlandsoppholdUtreisedato(dato, index){
        const planlagtUtenlandsopphold = {...state.PlanlagtUtenlandsoppholdArray[index]}
        planlagtUtenlandsopphold.planlagtUtreisedato = dato

        const tempUtreiseDato = [...state.PlanlagtUtenlandsoppholdArray.slice(0,index), planlagtUtenlandsopphold, ...state.PlanlagtUtenlandsoppholdArray.slice(index+1)]
        updateFieldInState("PlanlagtUtenlandsoppholdArray", tempUtreiseDato)
    }

    function planlagtUtenlandsoppholdInnreisedato(dato, index){
        const planlagtUtenlandsopphold = {...state.PlanlagtUtenlandsoppholdArray[index]}
        planlagtUtenlandsopphold.planlagtInnreisedato = dato

        const tempInnreiseDato = [...state.PlanlagtUtenlandsoppholdArray.slice(0,index), planlagtUtenlandsopphold, ...state.PlanlagtUtenlandsoppholdArray.slice(index+1)]
        updateFieldInState("PlanlagtUtenlandsoppholdArray", tempInnreiseDato)
    }

    function planlagtUtenlandsoppholdFelter(){
        if(state.planlagtUtenlandsopphold === "true"){

            return (
                <div>
                    <div>
                        {
                            state.PlanlagtUtenlandsoppholdArray.map((item, index) => ({...item, key: index}))
                                .map((item, index) => {
                                        return (
                                            <div key={item.key} style={container}>

                                                <InputFields id={`${item.key}-planlagtUtreisedato`}
                                                             labelText={"Utreisedato"}
                                                             value={item.planlagtUtreisedato}
                                                             onChange={(value) => planlagtUtenlandsoppholdUtreisedato(value, index)}
                                                />

                                                <InputFields id={`${item.key}-planlagtInnreisedato`}
                                                             labelText={"Innreisedato"}
                                                             value={item.planlagtInnreisedato}
                                                             onChange={(value) => planlagtUtenlandsoppholdInnreisedato(value, index)}
                                                />

                                                <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                          onClick={() => fjernValgtInputFelt(state.PlanlagtUtenlandsoppholdArray, "PlanlagtUtenlandsoppholdArray", index)}>Lukk</Lukknapp>
                                            </div>
                                        )
                                    }
                                )
                        }
                    </div>
                    <Knapp onClick={() => addInputFieldsPlantlagt(state.PlanlagtUtenlandsoppholdArray)}>Legg til flere planlagt utenlandsopphold</Knapp>
                </div>
            )
        }
    }


    return (
        <div>
            <Systemtittel>Utenlandsopphold</Systemtittel>
            <RadioGruppe legend="Har du vært utenlands i løpet av de siste 3 månedene?">

                <Radio name="utenlandsopphold"
                       label="Ja"
                       value="true"
                       checked={state.utenlandsopphold === "true"}
                       onChange={(e => updateFieldInState("utenlandsopphold", e.target.value))}
                />

                <Radio name="utenlandsopphold"
                       label="Nei"
                       value="false"
                       checked={state.utenlandsopphold === "false"}
                       onChange={(e => updateFieldInState("utenlandsopphold", e.target.value))}
                />
            </RadioGruppe>
            <div>
                {
                    utenlandsoppholdFelter()
                }
            </div>
            &nbsp;
            <RadioGruppe legend="Har du planer om å reise utenlands?">
                <Radio name="planlagtUtenlandsopphold"
                       label="Ja"
                       value="true"
                       checked={state.planlagtUtenlandsopphold === "true"}
                       onChange={(e => updateFieldInState("planlagtUtenlandsopphold", e.target.value))}
                />
                <Radio name="planlagtUtenlandsopphold"
                       label="Nei"
                       value="false"
                       checked={state.planlagtUtenlandsopphold === "false"}
                       onChange={(e => updateFieldInState("planlagtUtenlandsopphold", e.target.value))}
                />
            </RadioGruppe>
            <div>
                {
                    planlagtUtenlandsoppholdFelter()
                }
            </div>
            &nbsp;
            <Hovedknapp onClick={onClick}>Neste</Hovedknapp>
        </div>
    )
}


const container = {
    display: 'flex'
}

const fjernInnputKnappStyle = {
    alignSelf: 'center'
}

export default Utenlandsopphold;