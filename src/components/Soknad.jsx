import React from 'react';

import { Innholdstittel } from 'nav-frontend-typografi';
import Stegindikator from 'nav-frontend-stegindikator';
import { Panel } from 'nav-frontend-paneler';
import { Input } from 'nav-frontend-skjema';
import { SkjemaGruppe } from 'nav-frontend-skjema';
import { CheckboxGruppe, Checkbox } from 'nav-frontend-skjema';
import { RadioGruppe, Radio } from 'nav-frontend-skjema';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory, useLocation } from "react-router-dom";

function Soknad(){
	const history = useHistory();
	return(
		<>
			<Panel border>
				<Stegindikator
					steg={[
						{"label": "Personopplysninger","aktiv": true},
						{"label": "Oppholdstillatelse"},
						{"label": "Inntekt og pensjon"},
						{"label": "Formue"},
						{"label": "Send søknad"}
					]}
					onChange={(index) => {
						history.push("/");
					}}
					visLabel
				/>
				<div style={container}>
					<div style={containerLeft}>
						<SkjemaGruppe>
							<Input label="Fornavn" />
							<Input label="Etternavn" />
							<div style={container}>
								<Input label="Postnummer"/>
								<Input label="Poststed" />
							</div>
							<Input label="Statsborgerskap" />
							<CheckboxGruppe legend="Sivilstand">
								<Checkbox label={'Ugift'} />
								<Checkbox label={'Samboer'} />
								<Checkbox label={'Gift'} />
								<Checkbox label={'Registrert partner'} />
								<Checkbox label={'Separert'} />
								<Checkbox label={'Skilt'} />
								<Checkbox label={'Enke/enkemann'} />
								<Checkbox label={'Bor sammen med annen voksen'} />
							</CheckboxGruppe>
							<div style={container}>
							<RadioGruppe legend="Bor du fast i Norge?" style={containerLeft}>
                                <Radio label={'Ja'} name="Ja" />
                                <Radio label={'Nei'} name="Nei" />
                            </RadioGruppe>
                            <RadioGruppe legend="Har du oppholdt deg i utlandet i løpet av de siste 90 dagene?" style={containerRight}>
                                <Radio label={'Ja'} name="Ja" />
                                <Radio label={'Nei'} name="Nei" />
                            </RadioGruppe>
                            </div>
						</SkjemaGruppe>
					</div>
					<div style={containerRight}>
						<SkjemaGruppe>
							<Input label="Fødselsnummer" />
							<Input label="Telefonnummer" />
							<Input label="Kommune" />
							<RadioGruppe legend="Er du registrert som flyktning?" style={containerLeft}>
                                 <Radio label={'Ja'} name="Ja" />
                                 <Radio label={'Nei'} name="Nei" />
                             </RadioGruppe>
							 <RadioGruppe legend="Har du tenkt å oppholde deg i utlandet i mer enn 90 dager i løpet av de kommende 12 mnd?" style={containerLeft}>
                                 <Radio label={'Ja'} name="Ja" />
                                 <Radio label={'Nei'} name="Nei" />
                             </RadioGruppe>
						</SkjemaGruppe>
					</div>
				</div>
				<Hovedknapp onClick={() => history.push("/")}>Neste</Hovedknapp>
            </Panel>
		</>
	)
}
export default Soknad;

const container = {
	display: 'flex'
}
const containerLeft = {
    width: '50%'
}
const containerRight = {
    width: '50%'
}
