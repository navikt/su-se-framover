import React from 'react';
import Tekstomrade from 'nav-frontend-tekstomrade';
import Hovedknapp from 'nav-frontend-knapper';
import { CheckboxGruppe, Checkbox, CheckboksPanelGruppe, Input, TextareaControlled } from 'nav-frontend-skjema';
import { Innholdstittel, Undertittel, Element, Ingress } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import EtikettAdvarsel from 'nav-frontend-etiketter';


function Vilkarsprov(){
	return (
		<div>
			<Innholdstittel>Vilkårsprøving</Innholdstittel>
			<Panel border>
                <CheckboksPanelGruppe
                    checkboxes={[
                        { label: <Undertittel>§12-4 - §12-8 Uførhet</Undertittel>, value: 'uforhet', id: 'uforhet', subtext: <Uforevilkar/> },
                        { label: <Undertittel>§28 Flyktning</Undertittel>, value: 'flyktning', id: 'flyktning', subtext: <Flyktningvilkar/>},
                        { label: <Undertittel>§x-y Botid og opphold</Undertittel>, value: 'botid', id: 'botid', subtext: <BoOgOppholdVilkar/> },
                        { label: <Undertittel>§x-y Oppholdstillatelse</Undertittel>, value: 'opphold', id: 'opphold', subtext: <OppholdstillatelseVilkar/> },
                        { label: <Undertittel>§x-y Sivilstatus</Undertittel>, value: 'sivilstatus', id: 'sivilstatus', subtext: 'Enslig', checked: true, disabled: true},
                        { label: <Undertittel>§x-y Formue</Undertittel>, value: 'formue', id: 'formue', subtext: <FormueVilkar/> }
                    ]}
                    onChange={() => {}}
//                     feil="Her er det noe feil"
                />
			</Panel>
			<Hovedknapp>Lagre vilkårsvurdering</Hovedknapp>
		</div>
	)
}

function Uforevilkar(){
	return (
		<div>
			<Tekstomrade>{`For å kunne motta Supplerende stønad for uføre, må brukeren oppfylle vilkårene §12-2 til §12-8 i folketrygdloven`}
			</Tekstomrade>
			<br/>
			<TextareaControlled label="Begrunnelse"/>
		</div>
	)
}

function ufor(){
	return (
		<div>
			<Tekstomrade>{`For å kunne motta Supplerende stønad for uføre, må brukeren oppfylle vilkårene §12-2 til §12-8 i folketrygdloven`}
			</Tekstomrade>
		</div>
	)
}

const UforevilkarStyle = {
	display: 'flex'
}

function Flyktningvilkar(){
	return (
		<div>
			<Tekstomrade>{ `For å kunne motta Supplerende stønad for uføre må brukeren ha status som flyktning. Bla bla bla henhold til Utlendingsloven §28 blah blah` }</Tekstomrade>
				<br/>
				<TextareaControlled label="Begrunnelse"/>
		</div>
	)
}

function BoOgOppholdVilkar() {
	return (
		<div>
			<Tekstomrade>{`For å kunne motta Supplerende stønad for uføre må brukeren være bosatt og oppholde seg i Norge. Bla bla maksimal lengde på utlandsopphold 90 dager, bla bla mister retten til  motta bla bla`}</Tekstomrade>
			<br/>
			<TextareaControlled label="Begrunnelse"/>
		</div>
	)
}

function OppholdstillatelseVilkar(){
	return (
		<div>
			<Tekstomrade>{ `Brukeren må ha gyldig oppholdstillatelse i riket. blah blah` }</Tekstomrade>
			<br/>
			<TextareaControlled label="Begrunnelse"/>
		</div>
	)
}

function FormueVilkar(){
	return (
		<div>
			<Tekstomrade>{ `Brukeren må ha formue under 0,5G. Bla bla bla depositumskonto bla bla bla hytte og sånt` }</Tekstomrade>
			<br/>
			<TextareaControlled label="Begrunnelse"/>
		</div>
	)
}

export default Vilkarsprov;