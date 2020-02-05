import React from 'react'
import {Undertittel} from "nav-frontend-typografi";
import {Knapp} from "nav-frontend-knapper";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {Checkbox, CheckboxGruppe} from "nav-frontend-skjema";
import {Systemtittel} from "nav-frontend-typografi";
import { Hovedknapp } from 'nav-frontend-knapper';

const Boforhold = ({state, updateField, onClick}) =>{

    function updatedArray(sourceArray, target){
        if(target.checked){
            return [...sourceArray, target.value]
        }else{
            return sourceArray.filter(item => item !== target.value)
        }
    }

    function boSammenMedUpdate(target){
        updateField("borSammenMed", state =>(updatedArray(state, target)
        ))
    }

    function addInputFields(){
        const values = state.delerBoligMed
        values.push({navn:'', fødselsnummer:''})
        updateField("delerBoligMed", values)
    }

    function updateEPSnavn(navn, index){
        const ESPnavn = {...state.delerBoligMed[index]}
        ESPnavn.navn = navn

        const tempNavn = [...state.delerBoligMed.slice(0,index), ESPnavn, ...state.delerBoligMed.slice(index+1)]
        updateField("delerBoligMed", tempNavn)
    }

    function oppdaterFødselsnummer(fødselsnummer, index){
        const ESPfødselsnummer = {...state.delerBoligMed[index]}
        ESPfødselsnummer.fødselsnummer = fødselsnummer

        const tempFødselsnummer = [...state.delerBoligMed.slice(0,index), ESPfødselsnummer, ...state.delerBoligMed.slice(index+1)]
        updateField("delerBoligMed", tempFødselsnummer)
    }

    function personDelerBolig(){
        if(state.delerDuBolig === "true"){

            return (
                <CheckboxGruppe legend="Hvem deler du bolig med?">
                    <Checkbox name="boligdeler"
                              label="Ektefelle/Partner/Samboer"
                              value="esp" checked={state.borSammenMed.includes("esp")}
                              onChange={(e => boSammenMedUpdate(e.target))}
                    />
                    <Checkbox name="boligdeler"
                              label="Barn over 18 år"
                              value="over18"
                              checked={state.borSammenMed.includes("over18")}
                              onChange={(e => boSammenMedUpdate(e.target))}
                    />
                    <Checkbox name="boligdeler"
                              label="Andre personer over 18 år"
                              value="annenPerson"
                              checked={state.borSammenMed.includes("annenPerson")}
                              onChange={(e => boSammenMedUpdate(e.target))}
                    />
                </CheckboxGruppe>
            )
        }
    }

    function tillegsInfoESP(){
        if(state.delerDuBolig === "true"){
            return (
                <div>
                    <Undertittel>Opplysninger om ektefellen/samboer/annen voksen person hvis dere bor sammen</Undertittel>
                    {
                        state.delerBoligMed.map((item, index)=> ({...item, key:index}))
                            .map((item, index) => {
                                    return (
                                        <div key={item.key} style={container}>

                                            <InputFields id={`${item.key}-navn`}
                                                         labelText={"Navn"}
                                                         value={item.navn}
                                                         onChange={(value) => updateEPSnavn(value,index)}
                                            />

                                            <InputFields id={`${item.key}-fødselsnummer`}
                                                         labelText={"Fødselsnummer"}
                                                         value={item.fødselsnummer}
                                                         onChange={(value) => oppdaterFødselsnummer(value,index)}
                                            />

                                            <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                      onClick={() => fjernValgtInputFelt(state.delerBoligMed, "delerBoligMed", index)}>Lukk</Lukknapp>
                                        </div>
                                    )
                                }
                            )
                    }
                    <div>
                        <Knapp onClick={() => addInputFields()}>Legg til flere</Knapp>
                    </div>
                </div>
            )
        }
    }

    function fjernValgtInputFelt(state, field, index){
        const tempField = [...state.slice(0,index), ...state.slice(index+1)]
        updateField(field, tempField)
    }

    return (
        <div>
            <Systemtittel>Boforhold</Systemtittel>
            <div>
                <div style={container}>
                    <RadioGruppe legend="Deler du bolig med en annen voksen?">
                        <Radio name="delerDubolig"
                               label="Ja" value="true"
                               checked={state.delerDuBolig === "true"}
                               onChange={(e => updateField("delerDuBolig", e.target.value))}
                        />
                        <Radio name="delerDubolig"
                               label="Nei"
                               value="false"
                               checked={state.delerDuBolig === "false"}
                               onChange={(e => updateField("delerDuBolig", e.target.value))}
                        />
                    </RadioGruppe>
                    &nbsp;
                    {
                        personDelerBolig()
                    }
                </div>
                {
                    tillegsInfoESP()
                }
            </div>
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


export default Boforhold