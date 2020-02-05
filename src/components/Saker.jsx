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
			person: {
				fnr:'12345678910',
				fornavn:'Navn',
				etternavn:'Navnesen',
				adresse: {
					postnr: '1000',
					poststed: 'Oslo',
					gatenavn: 'Gategata',
					gatenr: '10'
				},
				sivilstand: {
					status: 'Gift',
					partner: 'Partner Partnersen 010101012351'
				},
				telefon: '123456789',
				epost: {
					epost: 'navn@navn.no',
					metadata: {
						kilde: "Kilde",
						oppdatert: "2016-01-01"
					}
				},
				statsborgerskap: [
					{
						land: 'ESP',
						fom: '2010-01-05',
					},
					{
						land: 'NOR',
						fom: '2019-07-06'
					}
				],
				foedsel: {
					foedeland: 'ESP',
					foedested: 'Barcelona',
					fodselsedato: '1954-06-01'
				},
				opphold: [
					{
						type: 'Midlertidig',
						fom: '2017-01-01',
						tom: '2018-01-01'
					},
					{
						type: 'Permanent',
						fom: '2018-01-01'
					}
				],
				folkeregisterpersonstatus: [
					{
						status: 'Bosatt',
						fom: '2018-01-01'
					},
					{
						status: 'Utflyttet',
						fom: '2017-01-01',
						tom: '2017-01-01'
					}
				]
			},
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