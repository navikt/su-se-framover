import React, {useState} from "react";
import {Systemtittel} from "nav-frontend-typografi";
import {RadioGruppe, Radio, Feiloppsummering} from 'nav-frontend-skjema';
import {InputFields} from "../FormElements";
import {Hovedknapp} from "nav-frontend-knapper";

const Oppholdstillatelse = ({state, updateField, onClick}) => {

    const [feilmeldinger, setFeilmeldinger] = useState([])

    const updateFunction = name => value => updateField(name, value)

    function midlertidigOppholdstillatelse(){
        if(state.varigopphold === "false"){

           return (
               <div style={{display: 'flex'}}>
                   <InputFields labelText="Oppholdstillatelsens utløpsdato"
                                id={fields.oppholdstillatelseUtløpsdato.htmlId}
                                bredde={"S"}
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
            {
                feilmeldinger.length > 0 && <Feiloppsummering tittel={"Vennligst fyll ut mangler"} feil={feilmeldinger} />
            }
            <Hovedknapp onClick={validateForm}>Neste</Hovedknapp>
        </div>
    )

    //------------Lett Validering-----------------------
    function validateForm(){
        const formValues = state
        const errors = validateFormValues(formValues)
        console.log(errors)
        setFeilmeldinger(errors)
        if(errors.length === 0){
            onClick()
        }
    }
}

const fields = {varigopphold: {label: 'varigopphold', htmlId: 'varigopphold'},
    oppholdstillatelseUtløpsdato: {label: 'oppholdstillatelseUtløpsdato', htmlId: 'oppholdstillatelseUtløpsdato'},
    soektforlengelse: {label: 'soektforlengelse', htmlId: 'soektforlengelse'}
}

function validateFormValues(formValues){
    const tempErrors = []

    tempErrors.push(...varigOppholdstillatelseValidering(formValues))
    tempErrors.push(...oppholdstillatelseUtløpsdatoValidering(formValues))
    tempErrors.push(...søktforlengelseValidering(formValues))

    return tempErrors
}

function varigOppholdstillatelseValidering(formValues){
    const varigOppholdstillatelse = formValues.varigopphold
    let feilmelding = ""

    if(varigOppholdstillatelse === undefined){
        feilmelding += "Vennligst velg varig-oppholdstillatelse"
    }
    if(feilmelding.length > 0){
        return [{skjemaelementId: fields.varigopphold.htmlId, feilmelding}]
    }
    return []
}

function oppholdstillatelseUtløpsdatoValidering(formValues){
    const oppholdstillatelseUtløpsdato = formValues.oppholdstillatelseUtløpsdato
    let feilmelding = ""

    if(formValues.varigopphold === "false"){
        if(!/^\d{2}\/\d{2}\/\d{2}$/.test(oppholdstillatelseUtløpsdato)) {
            if(oppholdstillatelseUtløpsdato === '' || oppholdstillatelseUtløpsdato === undefined){
                feilmelding += "Oppholdstillatelsens utløpsdato kan ikke være tom. Den må være i formen dd/mm/yy"
            }else{
                feilmelding += "Oppholdstillatelsens utløpsdato må være i formen dd/mm/yy"
            }
            if(feilmelding.length > 0){
                return [{skjemaelementId: fields.oppholdstillatelseUtløpsdato.htmlId, feilmelding}]
            }
        }
    }
    return []
}

function søktforlengelseValidering(formValues){
    const soektforlengelse = formValues.soektforlengelse
    let feilmelding = ""

    if(formValues.varigopphold === "false"){

        if(soektforlengelse === undefined){
            feilmelding += "Vennligst velg om søker har søkt om forlengelse"
        }
        if(feilmelding.length > 0){
            return [{skjemaelementId: fields.soektforlengelse.htmlId, feilmelding}]
        }
    }
    return []
}

export const validateOppholdstillatelse = {
    validateFormValues
}

export default Oppholdstillatelse;