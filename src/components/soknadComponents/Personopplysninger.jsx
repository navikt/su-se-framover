import React from 'react'
import {Systemtittel} from "nav-frontend-typografi";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {InputFields} from "../FormElements";


function Personopplysninger(state, setState, updateFunction, updateFieldInState){
    console.log(state)
    return (
        <div>
            <Systemtittel>Personlige opplysninger</Systemtittel>
            <div>
                <InputFields labelText="Fødselsnummer" onChange={updateFunction("fnr")} />
            </div>
            <div style={inputFieldsStyle}>
                <InputFields labelText="Fornavn"  onChange={updateFunction("fornavn")}/>
                <InputFields labelText="Mellomnavn" onChange={updateFunction("mellomnavn")}/>
                <InputFields labelText="Etternavn" onChange={updateFunction("etternavn")}/>
            </div>
            <div>
                <InputFields labelText="Telefonnummer" onChange={updateFunction("telefonnummer")}/>
            </div>
            <div style={container}>
                <InputFields labelText="Gateadresse" onChange={updateFunction("gateadresse")}/>
                <InputFields labelText="Bruksenhet" onChange={updateFunction("bruksenhet")}/>
            </div>
            <div style={container}>
                <InputFields labelText="Postnummer" onChange={updateFunction("postnummer")} />
                <InputFields labelText="Poststed" onChange={updateFunction("poststed")} />
                <InputFields labelText="Bokommune" onChange={updateFunction("bokommune")} />
            </div>
            <div>
                <InputFields labelText="Statsborgerskap" onChange={updateFunction("statsborgerskap")}/>
            </div>
            <div style={container}>
                <RadioGruppe legend="Er du registrert som flyktning?"   >
                    <Radio name="flyktning" label={'Ja'} value="true"  onChange={(e => updateFieldInState("flyktning", e.target.value))}/>
                    <Radio name="flyktning" label={'Nei'} value="false" onChange={(e => updateFieldInState("flyktning", e.target.value))}/>
                </RadioGruppe>
                &nbsp;
                <RadioGruppe legend="Bor du fast i Norge?" >
                    <Radio name="bofastnorge" label={'Ja'} value="true" onChange={(e => updateFieldInState("bofastnorge", e.target.value))}/>
                    <Radio name="bofastnorge" label={'Nei'} value="false" onChange={(e => updateFieldInState("bofastnorge", e.target.value))}/>
                </RadioGruppe>
            </div>
        </div>
    )

}
const inputFieldsStyle = {
    marginRight: '1em'
}

const container = {
    display: 'flex'
}


export default Personopplysninger;