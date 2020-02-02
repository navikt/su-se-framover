import React from "react";

const Oppholdstillatelse = (state, setState) => {
    console.log(state)

    return (
        <div>
            <Systemtittel>Opplysninger om oppholdstillatelse</Systemtittel>
            <RadioGruppe legend="Har du varig oppholdstillatelse?">
                <Radio name="varigopphold" label="Ja" />
                <Radio name="varigopphold" label="Nei" />
            </RadioGruppe>
            <Input label="Oppholdstillatelsens utløpsdato" />
            <RadioGruppe legend="Har du søkt om forlengelse?">
                <Radio name="soektforlengelse" label="Ja" />
                <Radio name="soektforlengelse" label="Nei" />
            </RadioGruppe>
        </div>
    )
}


export default Oppholdstillatelse;