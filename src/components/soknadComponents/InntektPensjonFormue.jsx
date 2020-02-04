import React from "react";

const InntektPensjonFormue = (state, setState) => {
	console.log(state)

	function updatePensjonsOrdning(kilde, index){
		const ordning = {...state.pensjonsOrdning[index]}
		ordning.ordning = kilde

		const tempPensjonsOrdning = [...state.pensjonsOrdning.slice(0,index), ordning, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempPensjonsOrdning)
	}

	function updatePensjonsOrdningsBeløp(kilde, index){
		const beløp = {...state.pensjonsOrdning[index]}
		beløp.beløp = kilde

		const tempPensjonsOrdning = [...state.pensjonsOrdning.slice(0,index), beløp, ...state.pensjonsOrdning.slice(index+1)]
		updateFieldInState("pensjonsOrdning", tempPensjonsOrdning)
	}

	function fjernValgtInputFelt(state, field, index){
		const tempField = [...state.slice(0,index), ...state.slice(index+1)]
		updateFieldInState(field, tempField)
	}

    return (
        <div>
            <Systemtittel>Pensjon og annen inntekt</Systemtittel>
            <RadioGruppe legend="Har du fremsatt krav om annen norsk eller utenlandsk ytelse/pensjon som ikke er avgjort?">
                <Radio name="kravannenytelse" label="Ja" />
                <Radio name="kravannenytelse" label="Nei" />
            </RadioGruppe>
            <Input label="Hva slags ytelse/pensjon?" />
            <RadioGruppe legend="Har du arbeidsinntekt/personinntekt?">
                <Radio name="arbeidselleranneninntekt" label="Ja" />
                <Radio name="arbeidselleranneninntekt" label="Nei" />
            </RadioGruppe>
            <Input label="Brutto beløp per år" />
            <RadioGruppe legend="Har du pensjon?">
                <Radio name="hardupensjon" label="Ja" />
                <Radio name="hardupensjon" label="Nei" />
            </RadioGruppe>
            <div>
                {
                    state.pensjonsOrdning.map((item, index)=> ({...item, key:index}))
                        .map((item, index) => {
                                return (
                                    <div key={item.key} style={container}>

                                        <InputFields id={`${item.key}-ordning`}
                                                     labelText={"Fra hvilken ordning mottar du pensjon?:"}
                                                     value={item.ordning}
                                                     onChange={(value) => updatePensjonsOrdning(value,index)}
                                        />

                                        <InputFields id={`${item.key}-beløp`}
                                                     labelText={"Brutto beløp per år"}
                                                     value={item.beløp}
                                                     onChange={(value) => updatePensjonsOrdningsBeløp(value,index)}
                                        />



                                        <Lukknapp type="button" style={fjernInnputKnappStyle}
                                                  onClick={() => fjernValgtInputFelt(state.pensjonsOrdning, "pensjonsOrdning", index)}>Lukk</Lukknapp>
                                    </div>
                                )
                            }
                        )
                }
            </div>
            <Knapp onClick={() => addInputFields(state.pensjonsOrdning)}>Legg til flere pensjonsordninger</Knapp>
            <Input label="Sum arbeidsinntekt/personinntekt, kapitalinntekt og pensjon" />

            {/* <Systemtittel>Pensjon og annen inntekt for ektefelle/samboer</Systemtittel>
						TODO */}


						<Systemtittel>Opplysninger om formue</Systemtittel>
						<RadioGruppe legend="Har du formue/eiendom?">
							<Radio name="harduformueeiendom" label="Ja" />
							<Radio name="harduformueeiendom" label="Nei" />
						</RadioGruppe>
						<RadioGruppe legend="Har du finansformue?">
							<Radio name="hardufinansformue" label="Ja" />
							<Radio name="hardufinansformue" label="Nei" />
						</RadioGruppe>
						<Input label="Beløp" />
						<RadioGruppe legend="Har du annen formue/eiendom?">
							<Radio name="harduannenformueeiendom" label="Ja" />
							<Radio name="harduannenformueeiendom" label="Nei" />
						</RadioGruppe>
						<div style={container}>
							<Input label="Type formue/eiendom" />
							<Input label="Samlet skattetakst" />
						</div>
						{/*tilsvarende spørsmål for ektefelle/samboer/partner/etc. */}


						<Systemtittel>Opplysninger om økonomisk sosialhjelp</Systemtittel>
						<RadioGruppe legend="Mottar du eller ektefellen/samboer eller har du eller han/hun i løpet av de siste tre månedene mottatt sosialstønad til livsopphold?">
							<Radio name="sosialstonad" label="Ja" />
							<Radio name="sosialstonad" label="Nei" />
						</RadioGruppe>
        </div>
    )
}



export default InntektPensjonFormue;