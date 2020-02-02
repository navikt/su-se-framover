import React from 'react'
import {Knapp} from "nav-frontend-knapper";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";

function Utenlandsopphold(state, setState) {
    console.log(state)

    function utenlandsopphold(){
        if(state.utenlandsopphold === "true"){

            return (
                <div>
                    <div>
                        <UtenlandsoppholdFelt />
                    </div>
                    <Knapp onClick={() => addInputFields(state.utenlandsoppholdArray)}>Legg til flere utenlandsopphold</Knapp>
                </div>
            )
        }
    }

    function UtenlandsoppholdFelt(){
        if(state.utenlandsopphold === "true") {
            return (
                <div>
                    {
                        state.utenlandsoppholdArray.map((item, index) => ({...item, key: index}))
                            .map((item, index) => {
                                    return (
                                        <div key={item.key} style={container}>

                                            <InputFields id={`${item.key}-utreisedato`}
                                                         labelText={"Utreisedato"}
                                                         value={item.utreisedato}
                                                         onChange={(value) => updatePensjonsOrdning(value, index)}
                                            />

                                            <InputFields id={`${item.key}-innreisedato`}
                                                         labelText={"Innreisedato"}
                                                         value={item.innreisedato}
                                                         onChange={(value) => updatePensjonsOrdningsBeløp(value, index)}
                                            />

                                            <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                      onClick={() => fjernValgtInputFelt(state.utenlandsoppholdArray, "utenlandsoppholdArray", index)}>Lukk</Lukknapp>
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
            <Systemtittel>Utenlandsopphold</Systemtittel>
            <RadioGruppe legend="Har du vært utenlands i løpet av de siste 3 månedene?">
                <Radio name="utenlandsopphold" label="Ja" value="true" onChange={(e => updateFieldInState("utenlandsopphold", e.target.value))}/>
                <Radio name="utenlandsopphold" label="Nei" value="false" onChange={(e => updateFieldInState("utenlandsopphold", e.target.value))}/>
            </RadioGruppe>
            <div>
                {
                    utenlandsopphold()
                }
            </div>
            <RadioGruppe legend="Har du planer om å reise utenlands?">
                <Radio name="planlagtutenlandsopphold" label="Ja" />
                <Radio name="planlagtutenlandsopphold" label="Nei" />
            </RadioGruppe>
            <div style={container}>
                <Input label="Utreisedato" />
                <Input label="Innreisedato" />
            </div>
            <Knapp>Legg til flere planlagte utenlandsopphold</Knapp>
        </div>
    )
}


export default Utelandsopphold;