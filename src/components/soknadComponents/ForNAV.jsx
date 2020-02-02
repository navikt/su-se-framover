import React from "react";


const ForNAV = (state, setState) => {
    console.log(state)

    return (
        <div>
            <Systemtittel>Språkform</Systemtittel>
            <RadioGruppe legend="Hvilken målform ønsker du i svaret?">
                <Radio name="maalform" label="Bokmål" />
                <Radio name="maalform" label="Nynorsk" />
            </RadioGruppe>

            <Systemtittel>For NAV</Systemtittel>s
            <RadioGruppe legend="Har bruker møtt personlig?">
                <Radio name="personligmote" label="Ja" />
                <Radio name="personligmote" label="Nei" />
            </RadioGruppe>
            <RadioGruppe legend="Har fullmektig møtt?">
                <Radio name="fullmektigmote" label="Ja" />
                <Radio name="fullmektigmote" label="Nei" />
            </RadioGruppe>
            <RadioGruppe legend="Er originalt(e) pass sjekket for stempel?">
                <Radio name="passsjekk" label="Ja" />
                <Radio name="passsjekk" label="Nei" />
            </RadioGruppe>
            <Input label="Merknader" />
        </div>
    )
}


export default ForNAV