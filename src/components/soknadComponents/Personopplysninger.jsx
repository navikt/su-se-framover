import React from 'react'
import {Systemtittel} from "nav-frontend-typografi";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {InputFields} from "../FormElements";
import {Hovedknapp} from "nav-frontend-knapper";


const Personopplysninger = ({state, updateFunction, updateFieldInState, onClick}) => {

    return (
        <div>
            <Systemtittel>Personlige opplysninger</Systemtittel>
            <div>
                <InputFields labelText="Fødselsnummer" value={state.fnr || ''} onChange={updateFunction("fnr")} />
            </div>
            <div style={inputFieldsStyle}>
                <InputFields labelText="Fornavn"  value={state.fornavn || ''} onChange={updateFunction("fornavn")}/>
                <InputFields labelText="Mellomnavn" value={state.mellomnavn || ''} onChange={updateFunction("mellomnavn")}/>
                <InputFields labelText="Etternavn" value={state.etternavn || ''} onChange={updateFunction("etternavn")}/>
            </div>
            <div>
                <InputFields labelText="Telefonnummer" value={state.telefonnummer || ''} onChange={updateFunction("telefonnummer")}/>
            </div>
            <div style={container}>
                <InputFields labelText="Gateadresse" value={state.gateadresse || ''} onChange={updateFunction("gateadresse")}/>
                <InputFields labelText="Bruksenhet" value={state.bruksenhet || ''} onChange={updateFunction("bruksenhet")}/>
            </div>
            <div style={container}>
                <InputFields labelText="Postnummer" value={state.postnummer || ''} onChange={updateFunction("postnummer")} />
                <InputFields labelText="Poststed" value={state.poststed || ''} onChange={updateFunction("poststed")} />
                <InputFields labelText="Bokommune" value={state.bokommune || ''} onChange={updateFunction("bokommune")} />
            </div>
            <div>
                <InputFields labelText="Statsborgerskap" value={state.statsborgerskap || ''} onChange={updateFunction("statsborgerskap")}/>
            </div>
            <div style={container}>
                <RadioGruppe legend="Er du registrert som flyktning?" >
                    <Radio name="flyktning"
                           label={'Ja'} value="true"
                           checked={state.flyktning === "true"}
                           onChange={(e => updateFieldInState("flyktning", e.target.value))}
                    />
                    <Radio name="flyktning"
                           label={'Nei'}
                           value="false"
                           checked={state.flyktning === "false"}
                           onChange={(e => updateFieldInState("flyktning", e.target.value))}
                    />
                </RadioGruppe>
                &nbsp;

                <RadioGruppe legend="Bor du fast i Norge?" >
                    <Radio name="bofastnorge"
                           label={'Ja'} value="true"
                           checked={state.bofastnorge === "true"}
                           onChange={(e => updateFieldInState("bofastnorge", e.target.value))}
                    />
                    <Radio name="bofastnorge"
                           label={'Nei'}  value="false"
                           checked={state.bofastnorge === "false"}
                           onChange={(e => updateFieldInState("bofastnorge", e.target.value))}
                    />
                </RadioGruppe>
            </div>
            <Hovedknapp onClick={onClick}>Neste</Hovedknapp>
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