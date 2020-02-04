import React from 'react';
import 'nav-frontend-tabell-style';
import { Checkbox } from 'nav-frontend-skjema';
import Lenke from 'nav-frontend-lenker';
import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import { ToggleGruppe } from 'nav-frontend-toggle';
import { useLocation, useHistory} from "react-router-dom";

function Saksoversikt(){
	const history = useHistory();
	console.log(history.location.state)
	return(
		<>
		todo
		</>
	)
}

export default Saksoversikt;