import React from 'react'
import {Undertittel} from "nav-frontend-typografi";
import {Knapp} from "nav-frontend-knapper";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {Checkbox, CheckboxGruppe} from "nav-frontend-skjema";
import {Systemtittel} from "nav-frontend-typografi";

const Boforhold = ({state, setState, updateFunction, updateFieldInState, addInputFields}) =>{
    console.log(state)

    function updatedArray(sourceArray, target){
        if(target.checked){
            return [...sourceArray, target.value]
        }else{
            return sourceArray.filter(item => item !== target.value)
        }
    }

    function boSammenMedUpdate(target){
        setState(state =>({
            ...state,
            borSammenMed: updatedArray(state.borSammenMed, target)
        }))
    }

    function personDelerBolig(){
        if(state.delerDuBolig === "true"){

            return (
                <CheckboxGruppe legend="Hvem deler du bolig med?">
                    <Checkbox name="boligdeler" label="Ektefelle/Partner/Samboer" value="esp" onChange={(e => boSammenMedUpdate(e.target))}/>
                    <Checkbox name="boligdeler" label="Barn over 18 år" value="over18" onChange={(e => boSammenMedUpdate(e.target))}/>
                    <Checkbox name="boligdeler" label="Andre personer over 18 år" value="annenPerson" onChange={(e => boSammenMedUpdate(e.target))}/>
                </CheckboxGruppe>
            )
        }
    }

    function tillegsInfoDelerBolig(){
        if(state.delerDuBolig === "true"){

            return (
                <div>
                    <Undertittel>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Undertittel>
                    <Opplysningerfelt />
                    <div>
                        <Knapp onClick={() => addInputFields(state.delerBoligMed)}>Legg til flere</Knapp>
                    </div>
                </div>
            )
        }
    }

    function Opplysningerfelt(){
        if(state.delerDuBolig === "true"){

            return (
                <div>
                    {
                        state.delerBoligMed.map((item, index)=> ({...item, key:index}))
                            .map((item, index) => {
                                    return (
                                        <div key={item.key} style={container}>

                                            <InputFields id={`${item.key}-navn`}
                                                         labelText={"Navn"}
                                                         value={item.navn}
                                                         onChange={(value) => updatePensjonsOrdning(value,index)}
                                            />

                                            <InputFields id={`${item.key}-fødselsnummer`}
                                                         labelText={"Fødselsnummer"}
                                                         value={item.fødselsnummer}
                                                         onChange={(value) => updatePensjonsOrdningsBeløp(value,index)}
                                            />

                                            <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                      onClick={() => fjernValgtInputFelt(state.delerBoligMed, "delerBoligMed", index)}>Lukk</Lukknapp>
                                        </div>
                                    )
                                }
                            )
                    }
                </div>
            )
        }
    }

    function fjernValgtInputFelt(state, field, index){
        const tempField = [...state.slice(0,index), ...state.slice(index+1)]
        updateFieldInState(field, tempField)
    }

    return (
        <div>
            <Systemtittel>Boforhold</Systemtittel>
            <div>
                <div style={container}>
                    <RadioGruppe legend="Deler du bolig med en annen voksen?">
                        <Radio name="delerDubolig" label="Ja" value="true" onChange={(e => updateFieldInState("delerDuBolig", e.target.value))} />
                        <Radio name="delerDubolig" label="Nei" value="false" onChange={(e => updateFieldInState("delerDuBolig", e.target.value))}/>
                    </RadioGruppe>
                    &nbsp;
                    {
                        personDelerBolig()
                    }
                </div>
                {
                    tillegsInfoDelerBolig()
                }
            </div>
        </div>
    )
}


const container = {
    display: 'flex'
}

const fjernInnputKnappStyle = {
    alignSelf: 'center'
}


export default Boforhold