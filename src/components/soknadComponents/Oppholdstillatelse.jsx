import React from "react";
import {Systemtittel} from "nav-frontend-typografi";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {InputFields} from "../FormElements";
import {Hovedknapp} from "nav-frontend-knapper";

const Oppholdstillatelse = ({state, updateField, onClick}) => {

    const updateFunction = name => value => updateField(name, value)

    function midlertidigOppholdstillatelse(){
        if(state.varigopphold === "false"){

           return (
               <div>
                   <InputFields labelText="Oppholdstillatelsens utløpsdato"
                                value={state.oppholdstillatelseUtløpsdato || ''}
                                onChange={updateFunction("oppholdstillatelseUtløpsdato")}
                   />
                   <RadioGruppe legend="Har du søkt om forlengelse?">
                       <Radio name="soektforlengelse"
                              label="Ja"
                              value="true"
                              checked={state.soektforlengelse === "true"}
                              onChange={(e => updateField("soektforlengelse", e.target.value))}
                       />

                       <Radio name="soektforlengelse"
                              label="Nei"
                              value="false"
                              checked={state.soektforlengelse === "false"}
                              onChange={(e => updateField("soektforlengelse", e.target.value))}
                       />
                   </RadioGruppe>
               </div>
           )
        }
    }

    return (
        <div>
            <Systemtittel>Opplysninger om oppholdstillatelse</Systemtittel>

            <div>
                <RadioGruppe legend="Har du varig oppholdstillatelse?">
                    <Radio name="varigopphold"
                           label="Ja"
                           value="true"
                           checked={state.varigopphold === "true"}
                           onChange={(e => updateField("varigopphold", e.target.value))}
                    />
                    <Radio name="varigopphold"
                           label="Nei"
                           value="false"
                           checked={state.varigopphold === "false"}
                           onChange={(e => updateField("varigopphold", e.target.value))}
                    />
                </RadioGruppe>
                <div>
                    {
                        midlertidigOppholdstillatelse()
                    }
                </div>
            </div>
            <Hovedknapp onClick={onClick}>Neste</Hovedknapp>
        </div>
    )
}


export default Oppholdstillatelse;