import React from 'react';
import 'nav-frontend-tabell-style';
import { Checkbox } from 'nav-frontend-skjema';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { ToggleGruppe } from 'nav-frontend-toggle';
import { useLocation, useHistory} from "react-router-dom";

function Kravliste(){
	const history = useHistory();

	const sorting = ['alle']
	const kravliste = [
		{fnr:'12345678910', type:'Førstegang', mottatt:'01.10.2020', status:'Til behandling'},
		{fnr:'12345678911', type:'Førstegang', mottatt:'01.10.2020', status:'Til attestering'},
		{fnr:'12345678912', type:'Revurdering', mottatt:'01.10.2020', status:'Mangler dokumentasjson'},
		{fnr:'12345678913', type:'Revurdering', mottatt:'01.10.2020', status:'Klar til behandling'},
	];
	return(
		<>
		<ToggleGruppe
            defaultToggles={[
                { children: 'alle', pressed: true},
                { children: 'til behandling' },
                { children: 'til attestering' },
                { children: 'mangler dokumentasjon' },
                { children: 'klar til behandling' }
            ]}
            multiSelect
            onChange={(index) => {console.log(sorting)}}
        />
		<table className="tabell">
            <thead>
                <tr>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Fnr</Lenke></th>
                    <th role="columnheader" aria-sort="descending" className="tabell__th--sortert-desc"><Lenke href="#">Type</Lenke></th>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Mottatt</Lenke></th>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Status</Lenke></th>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Handlinger</Lenke></th>
                </tr>
            </thead>
            <tbody>
           		{
           			kravliste.map((krav, index) => {
           				return (
					    <tr key={index}>
							<td>{krav.fnr}</td>
							<td className="tabell__td--sortert">{krav.type}</td>
							<td>{krav.mottatt}</td>
							<td>{krav.status}</td>
							<td><Hovedknapp onClick={() => history.push("/vilkarsprov")}>{getHandlingFromStatus(krav.status)}</Hovedknapp></td>
						</tr>
           				)
           			})
           		}
            </tbody>
        </table>
		</>
	)
}

function getHandlingFromStatus(status){
	if(status === 'Til behandling') return 'Se'
	if(status === 'Til attestering') return 'Attester'
	if(status === 'Mangler dokumentasjson' || status == 'Klar til behandling') return 'Behandle'
}

export default Kravliste;