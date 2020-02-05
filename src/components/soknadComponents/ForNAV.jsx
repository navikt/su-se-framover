import React from "react";
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import {Systemtittel} from "nav-frontend-typografi";
import {InputFields} from "../FormElements";
import {Hovedknapp} from "nav-frontend-knapper";

const ForNAV = ({state, updateField, onClick}) => {

    const updateFunction = name => value => updateField(name, value)

    return (
        <div>
            <div>
                <Systemtittel>Språkform</Systemtittel>
                <div>
                    <RadioGruppe legend="Hvilken målform ønsker du i svaret?">
                        <div style={container}>
                            <Radio name="maalform"
                                   label="Bokmål"
                                   value="bokmål"
                                   checked={state.maalform === "bokmål"}
                                   onChange={(e => updateField("maalform", e.target.value))}
                            />
                            &nbsp;
                            <Radio name="maalform"
                                   label="Nynorsk"
                                   value="nynorsk"
                                   checked={state.maalform === "nynorsk"}
                                   onChange={(e => updateField("maalform", e.target.value))}
                            />
                        </div>
                    </RadioGruppe>
                </div>
            </div>

            <div>
                <Systemtittel>For NAV</Systemtittel>
                <div style={container}>
                    <div>
                        <RadioGruppe legend="Har bruker møtt personlig?">
                            <Radio name="personligmote"
                                   label="Ja"
                                   value="ja"
                                   checked={state.personligmote === "ja"}
                                   onChange={(e => updateField("personligmote", e.target.value))}
                            />
                            <Radio name="personligmote"
                                   label="Nei"
                                   value="nei"
                                   checked={state.personligmote === "nei"}
                                   onChange={(e => updateField("personligmote", e.target.value))}
                            />
                        </RadioGruppe>
                    </div>
                    &nbsp;
                    <div>
                        <RadioGruppe legend="Har fullmektig møtt?">
                            <Radio name="fullmektigmote"
                                   label="Ja"
                                   value="ja"
                                   checked={state.fullmektigmote === "ja"}
                                   onChange={(e => updateField("fullmektigmote", e.target.value))}
                            />
                            <Radio name="fullmektigmote"
                                   label="Nei"
                                   value="nei"
                                   checked={state.fullmektigmote === "nei"}
                                   onChange={(e => updateField("fullmektigmote", e.target.value))}
                            />
                        </RadioGruppe>
                    </div>
                    &nbsp;
                    <div>
                        <RadioGruppe legend="Er originalt(e) pass sjekket for stempel?">
                            <Radio name="passsjekk"
                                   label="Ja"
                                   value="ja"
                                   checked={state.passsjekk === "ja"}
                                   onChange={(e => updateField("passsjekk", e.target.value))}
                            />
                            <Radio name="passsjekk"
                                   label="Nei"
                                   value="nei"
                                   checked={state.passsjekk === "nei"}
                                   onChange={(e => updateField("passsjekk", e.target.value))}
                            />
                        </RadioGruppe>
                    </div>
                </div>
            </div>
            <InputFields labelText="Merknader"
                         value={state.forNAVmerknader || ''}
                         onChange={updateFunction("forNAVmerknader")}
            />
            <Hovedknapp onClick={onClick}>Neste</Hovedknapp>
        </div>
    )
}

const container = {
    display: 'flex'
}


export default ForNAV