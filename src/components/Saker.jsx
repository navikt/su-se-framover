import React from 'react';
import 'nav-frontend-tabell-style';
import { Checkbox } from 'nav-frontend-skjema';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { ToggleGruppe } from 'nav-frontend-toggle';
import { useLocation, useHistory } from "react-router-dom";

function Saker(){
	const history = useHistory();
	var state = history.location.state;

	var saker = [];
		saker.push(
		{
			sakid: '01234',
			person: {fnr:'12345678910'},
			status: 'Til behandling',
			stonadsperioder: [
				{
					fom:'01.01.20',
					tom:'01.01.21',
					krav: [
						{
							type:'Fortsettelse',
							mottatt:'05.01.20'
						}
					],
					vedtak: []
				},
				{
					fom:'01.01.19',
					tom:'01.01.20',
					krav: [
						{
							type:'Førstegangssøknad',
							mottatt:'01.01.19'
						}
					],
					vedtak: [
						{
							status:'Iverksatt',
							årsak:'Tilstått ytelse'
						}
					]
				}
			]
		}
		);
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
           			saker.map((sak, index) => {
           				return (
					    <tr key={index}>
							<td>{sak.person.fnr}</td>
							<td>{sak.status}</td>
							<td><Hovedknapp onClick={() => history.push("/saksoversikt", saker[0])}>{"Behandle"}</Hovedknapp></td>
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