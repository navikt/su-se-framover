import React, {useState} from 'react'
import {Hovedknapp, Knapp} from "nav-frontend-knapper";
import {InputFields} from "../FormElements";
import Lukknapp from "nav-frontend-lukknapp";
import {Systemtittel} from "nav-frontend-typografi";
import { RadioGruppe, Radio, Feiloppsummering} from 'nav-frontend-skjema';


const Utenlandsopphold = ({state, updateField, onClick}) =>{

    const [feilmeldinger, setFeilmeldinger] = useState([])

    const fields= {utenlandsopphold: {label: 'utenlandsopphold', htmlId: 'utenlandsopphold'},
                    planlagtUtenlandsopphold: {label: 'planlagtUtenlandsopphold', htmlId: 'planlagtUtenlandsopphold'}
    }


    function addInputFields(){
        const values = state.utenlandsoppholdArray
        values.push({utreisedato:'', innreisedato:''})
        updateField("utenlandsoppholdArray", values)
    }

    function utenlandsoppholdUtreisedato(dato, index){
        const utenlandsopphold = {...state.utenlandsoppholdArray[index]}
        utenlandsopphold.utreisedato = dato

        const tempUtreiseDato = [...state.utenlandsoppholdArray.slice(0,index), utenlandsopphold, ...state.utenlandsoppholdArray.slice(index+1)]
        updateField("utenlandsoppholdArray", tempUtreiseDato)
    }

    function utenlandsoppholdInnreisedato(dato, index){
        const utenlandsopphold = {...state.utenlandsoppholdArray[index]}
        utenlandsopphold.innreisedato = dato

        const tempInnreiseDato = [...state.utenlandsoppholdArray.slice(0,index), utenlandsopphold, ...state.utenlandsoppholdArray.slice(index+1)]
        updateField("utenlandsoppholdArray", tempInnreiseDato)
    }


    function fjernValgtInputFelt(state, field, index){
        const tempField = [...state.slice(0,index), ...state.slice(index+1)]
        updateField(field, tempField)
    }

    function utenlandsoppholdFelter(){
        if(state.utenlandsopphold === "true"){

            return (
                <div>
                    <div>
                        {
                            state.utenlandsoppholdArray.map((item, index) => ({...item, key: index}))
                                .map((item, index) => {
                                        return (
                                            <div key={item.key} style={container}>

                                                <InputFields id={`${item.key}-utreisedato`}
                                                             labelText={"Utreisedato"}
                                                             value={item.utreisedato}
                                                             onChange={(value) => utenlandsoppholdUtreisedato(value, index)}
                                                />

                                                <InputFields id={`${item.key}-innreisedato`}
                                                             labelText={"Innreisedato"}
                                                             value={item.innreisedato}
                                                             onChange={(value) => utenlandsoppholdInnreisedato(value, index)}
                                                />

                                                <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                          onClick={() => fjernValgtInputFelt(state.utenlandsoppholdArray, "utenlandsoppholdArray", index)}>Lukk</Lukknapp>
                                            </div>
                                        )
                                    }
                                )
                        }
                    </div>
                    <Knapp onClick={() => addInputFields(state.utenlandsoppholdArray)}>Legg til flere utenlandsopphold</Knapp>
                </div>
            )
        }
    }

//--------------------Planlagt utenlandsopphold ------------------------------
    function addInputFieldsPlantlagt(){
        const values = state.PlanlagtUtenlandsoppholdArray
        values.push({planlagtUtreisedato:'', planlagtInnreisedato:''})
        updateField("planlagtUtenlandsoppholdArray", values)
    }

    function planlagtUtenlandsoppholdUtreisedato(dato, index){
        const planlagtUtenlandsopphold = {...state.planlagtUtenlandsoppholdArray[index]}
        planlagtUtenlandsopphold.planlagtUtreisedato = dato

        const tempUtreiseDato = [...state.planlagtUtenlandsoppholdArray.slice(0,index), planlagtUtenlandsopphold, ...state.planlagtUtenlandsoppholdArray.slice(index+1)]
        updateField("planlagtUtenlandsoppholdArray", tempUtreiseDato)
    }

    function planlagtUtenlandsoppholdInnreisedato(dato, index){
        const planlagtUtenlandsopphold = {...state.planlagtUtenlandsoppholdArray[index]}
        planlagtUtenlandsopphold.planlagtInnreisedato = dato

        const tempInnreiseDato = [...state.planlagtUtenlandsoppholdArray.slice(0,index), planlagtUtenlandsopphold, ...state.planlagtUtenlandsoppholdArray.slice(index+1)]
        updateField("planlagtUtenlandsoppholdArray", tempInnreiseDato)
    }

    function planlagtUtenlandsoppholdFelter(){
        if(state.planlagtUtenlandsopphold === "true"){

            return (
                <div>
                    <div>
                        {
                            state.planlagtUtenlandsoppholdArray.map((item, index) => ({...item, key: index}))
                                .map((item, index) => {
                                        return (
                                            <div key={item.key} style={container}>

                                                <InputFields id={`${item.key}-planlagtUtreisedato`}
                                                             labelText={"Utreisedato"}
                                                             value={item.planlagtUtreisedato}
                                                             onChange={(value) => planlagtUtenlandsoppholdUtreisedato(value, index)}
                                                />

                                                <InputFields id={`${item.key}-planlagtInnreisedato`}
                                                             labelText={"Innreisedato"}
                                                             value={item.planlagtInnreisedato}
                                                             onChange={(value) => planlagtUtenlandsoppholdInnreisedato(value, index)}
                                                />

                                                <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                          onClick={() => fjernValgtInputFelt(state.planlagtUtenlandsoppholdArray, "PlanlagtUtenlandsoppholdArray", index)}>Lukk</Lukknapp>
                                            </div>
                                        )
                                    }
                                )
                        }
                    </div>
                    <Knapp onClick={() => addInputFieldsPlantlagt(state.planlagtUtenlandsoppholdArray)}>Legg til flere planlagt utenlandsopphold</Knapp>
                </div>
            )
        }
    }


    return (
        <div>
            <Systemtittel>Utenlandsopphold</Systemtittel>
            <RadioGruppe legend="Har du vært utenlands i løpet av de siste 3 månedene?">

                <Radio name="utenlandsopphold"
                       label="Ja"
                       value="true"
                       checked={state.utenlandsopphold === "true"}
                       onChange={(e => updateField("utenlandsopphold", e.target.value))}
                />

                <Radio name="utenlandsopphold"
                       label="Nei"
                       value="false"
                       checked={state.utenlandsopphold === "false"}
                       onChange={(e => updateField("utenlandsopphold", e.target.value))}
                />
            </RadioGruppe>
            <div>
                {
                    utenlandsoppholdFelter()
                }
            </div>
            &nbsp;
            <RadioGruppe legend="Har du planer om å reise utenlands?">
                <Radio name="planlagtUtenlandsopphold"
                       label="Ja"
                       value="true"
                       checked={state.planlagtUtenlandsopphold === "true"}
                       onChange={(e => updateField("planlagtUtenlandsopphold", e.target.value))}
                />
                <Radio name="planlagtUtenlandsopphold"
                       label="Nei"
                       value="false"
                       checked={state.planlagtUtenlandsopphold === "false"}
                       onChange={(e => updateField("planlagtUtenlandsopphold", e.target.value))}
                />
            </RadioGruppe>
            <div>
                {
                    planlagtUtenlandsoppholdFelter()
                }
            </div>
            &nbsp;
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

    function validateFormValues(formValues){
        const tempErrors = []
        const utenlandsoppholdErrors = []
        const planlagtUtenlandsoppholdErrors = []
        tempErrors.push(...utenlandsoppholdValidering(formValues))
        tempErrors.push(...utenlandsoppholdFelterValidering(formValues, utenlandsoppholdErrors))
        tempErrors.push(...planlagtUtenlandsoppholdValidering(formValues))
        tempErrors.push(...planlagtUtenlandsoppholdFelterValidering(formValues, planlagtUtenlandsoppholdErrors))

        return tempErrors
    }

    function utenlandsoppholdValidering(formValues){
        const utenlandsopphold = formValues.utenlandsopphold
        let feilmelding = ""

        if(utenlandsopphold === undefined){
            feilmelding += "Vennligst velg utenlandsopphold"
        }
        if(feilmelding.length > 0){
            return [{skjemaelementId: fields.utenlandsopphold.htmlId, feilmelding}]
        }
        return []
    }


    function utenlandsoppholdFelterValidering(formValues, errorsArray){
        const tempUtenlandsoppholdArray = formValues.utenlandsoppholdArray

        if(formValues.utenlandsopphold === "true"){
            tempUtenlandsoppholdArray.map((item, index) => {
                if(!/^\d{2}\/\d{2}\/\d{2}$/.test(item.utreisedato)){
                    if(item.utreisedato === "" || item.utreisedato === undefined){
                        errorsArray.push({
                            skjemaelementId: `${index}-utreisedato`,
                            feilmelding: "Utreisedato må være ikke være tom. Den må være i formed dd/mm/yy"})
                    }else{
                        errorsArray.push({
                            skjemaelementId: `${index}-utreisedato`,
                            feilmelding: "Utreisedato må være en dato i formen dd/mm/yy"})
                    }
                }
                if(!/^\d{2}\/\d{2}\/\d{2}$/.test(item.innreisedato)) {
                    if (item.innreisedato === "" || item.innreisedato === undefined) {
                        errorsArray.push({
                            skjemaelementId: `${index}-innreisedato`,
                            feilmelding: "Innreisedato må være ikke være tom. Den må være i formed dd/mm/yy"
                        })
                    } else {
                        errorsArray.push({
                            skjemaelementId: `${index}-innreisedato`,
                            feilmelding: "Innreisedato må være en dato i formen dd/mm/yy"
                        })
                    }
                }
            })
        }
        return errorsArray
    }


    function planlagtUtenlandsoppholdValidering(formValues){
        const planlagtUtenlandsopphold = formValues.planlagtUtenlandsopphold
        let feilmelding = ""

        if(planlagtUtenlandsopphold === undefined){
            feilmelding += "Vennligst velg planlagt utenlandsopphold"
        }
        if(feilmelding.length > 0){
            return [{skjemaelementId: fields.planlagtUtenlandsopphold.htmlId, feilmelding}]
        }
        return []
    }

    function planlagtUtenlandsoppholdFelterValidering(formValues, errorsArray){
        const tempPlanlagtUtenlandsoppholdArray = formValues.planlagtUtenlandsoppholdArray

        if(formValues.planlagtUtenlandsopphold === "true"){
            tempPlanlagtUtenlandsoppholdArray.map((item, index) => {
                    if(!/^\d{2}\/\d{2}\/\d{2}$/.test(item.planlagtUtreisedato)){
                        if(item.planlagtUtreisedato === "" || item.planlagtUtreisedato === undefined){
                            errorsArray.push({
                                skjemaelementId: `${index}-planlagtUtreisedato`,
                                feilmelding: "Planlagt utreisedato må være ikke være tom. Den må være i formed dd/mm/yy"})
                        }else{
                            errorsArray.push({
                                skjemaelementId: `${index}-planlagtUtreisedato`,
                                feilmelding: "Planlagt utreisedato må være en dato i formen dd/mm/yy"})
                        }
                    }
                if(!/^\d{2}\/\d{2}\/\d{2}$/.test(item.planlagtInnreisedato)) {
                    if (item.planlagtInnreisedato === "" || item.planlagtInnreisedato === undefined) {
                        errorsArray.push({
                            skjemaelementId: `${index}-planlagtInnreise`,
                            feilmelding: "Planlagt Innreise må være ikke være tom. Den må være i formed dd/mm/yy"
                        })
                    } else {
                        errorsArray.push({
                            skjemaelementId: `${index}-planlagtInnreise`,
                            feilmelding: "Planlagt Innreise må være en dato i formen dd/mm/yy"
                        })
                    }
                }
            })
        }
        return errorsArray
    }
}


const container = {
    display: 'flex'
}

const fjernInnputKnappStyle = {
    alignSelf: 'center'
}

export default Utenlandsopphold;