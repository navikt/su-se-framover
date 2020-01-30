import React from 'react';
import 'nav-frontend-tabell-style';
import { Checkbox } from 'nav-frontend-skjema';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { ToggleGruppe } from 'nav-frontend-toggle';
import { useLocation, useHistory} from "react-router-dom";

function Saker(){
	const history = useHistory();

	const sorting = ['alle']
	const saker = [
		{fnr:'12345678910', status:'Til behandling'},
		{fnr:'12345678911', status:'Til attestering'},
		{fnr:'12345678912', status:'Mangler dokumentasjson'},
		{fnr:'12345678913', status:'Klar til behandling'}
	];
	return(
		<>
		<table className="tabell">
            <thead>
                <tr>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Fnr</Lenke></th>
                    <th role="columnheader" aria-sort="none"><Lenke href="#">Status</Lenke></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
           		{
           			saker.map((krav, index) => {
           				return (
					    <tr key={index}>
							<td>{krav.fnr}</td>
							<td>{krav.status}</td>
							<td><Hovedknapp onClick={() => history.push("/vilkarsprov")}>{"Behandle"}</Hovedknapp></td>
						</tr>
           				)
           			})
           		}
            </tbody>
        </table>
		</>
	)
}

export default Saker;