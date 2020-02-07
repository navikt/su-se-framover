import { hot } from 'react-hot-loader';
import React, {useContext, useEffect, useRef, useState} from 'react';
import { useConfig } from './useConfig';
import { useGet } from './useGet';
import { useAuthRedirect } from './useAuthRedirect';
import { AuthContext, AuthContextProvider } from './AuthContext';
import { Normaltekst, Innholdstittel } from 'nav-frontend-typografi';
import { Panel } from 'nav-frontend-paneler';
import { Knapp } from 'nav-frontend-knapper';
import 'reset-css'
import Soknad from "./Soknad"
import Saker from "./Saker"
import Saksoversikt from "./Saksoversikt"
import Vilkarsprov from "./Vilkarsprov";
import Beregning from "./Beregning"
import ErrorBoundary from './ErrorBoundary'
import 'nav-frontend-tabell-style';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useLocation,
  useHistory
} from "react-router-dom";


const Root = () => {
    const { config } = useConfig();
    const [state, setState] = useState({
        vilkårsprøving: undefined,
        beregning: undefined
    })

    const updateVilkårsvurdering = nyeVilkår => {
        setState(state => ({
            ...state,
            vilkårsprøving: (
                typeof nyeVilkår === 'function' ?
                    nyeVilkår(state.vilkårsprøving) :
                    nyeVilkår
            )
        }))
    }


    useEffect(() =>{
        console.log(state)
    }, [state])
    const updateBeregning = nyBeregning => {
        setState(state => ({
            ...state,
            beregning: (
                typeof nyBeregning === 'function' ?
                    nyBeregning(state.beregning) :
                    nyBeregning
            )
        }))
    }

    return (
        <ErrorBoundary>
            <AuthContextProvider>
                <Router>
                    <ContentWrapper config={config}>
                        <Switch>
                            <Route path="/" exact>
                                <Main config={config}/>
                            </Route>
                            <Route path="/person">
                                <Person config={config}/>
                            </Route>
                            <Route path="/auth/complete">
                                <AuthComplete/>
                            </Route>
							<Route path="/soknad" >
                                <Soknad config={config}/>
                            </Route>
							<Route path="/saker">
                                <Saker/>
                            </Route>
                            <Route path="/vilkarsprov">
                                <Vilkarsprov state={state.vilkårsprøving} setState={updateVilkårsvurdering} />
                            </Route>
							<Route path="/saksoversikt">
                                <Saksoversikt />
                            </Route>
                            <Route path="/Beregning">
                                <Beregning state={state.beregning} setState={updateBeregning}/>
                            </Route>
                        </Switch>
                    </ContentWrapper>
                </Router>
            </AuthContextProvider>
        </ErrorBoundary>
    )
};

function Main({config}){
    const url = config ? config.suSeBakoverUrl + "/authenticated" : undefined;
    const loginUrl = config ? config.suSeBakoverUrl + "/login" : undefined;
    const { data, isFetching } = useAuthRedirect({ url, loginUrl });
    const message = data ? data.data : "this message unreadable";
    return (
        <div>
            <h1>Hello world!</h1>
            {isFetching ? "fetching" : <h2>{message}</h2>}
        </div>
    )
}

function Person({config}){
    const history = useHistory();
    const {fornavn, etternavn} = history.location.state.data
    return (
        <div>
            <Panel>
				<Innholdstittel>Personinfo</Innholdstittel>
				<Panel border>
					<div><Normaltekst tag="span">Fornavn: </Normaltekst><Normaltekst tag="span">{fornavn}</Normaltekst></div>
					<div><Normaltekst tag="span">Etternavn: </Normaltekst><Normaltekst tag="span">{etternavn}</Normaltekst></div>
				</Panel>
				<Inntekt config={config}/>
            </Panel>
       	</div>
    )
}

function Inntekt({config}){
    const history = useHistory();
    const props = history.location.state
    const url = config ? config.suSeBakoverUrl + `/inntekt?ident=${props.ident}&fomDato=${props.fomDato}&tomDato=${props.tomDato}` : undefined;
    const { data } = useGet({ url });
    const inntekt = data ? data.maanedligInntekter[0].inntekter[0].beloep : ""
    return (
		<div>
			<Innholdstittel>Inntekter</Innholdstittel>
			<Panel border>
				<InntektsTabell inntekt={data}/>
			</Panel>
		</div>
    )
}

function InntektsTabell({inntekt}){
  if(inntekt){
    return (
      <table className="tabell">
      	<thead>
      		<tr>
      			<th>Periode</th>
      			<th>Type</th>
      			<th>Beskrivelse</th>
      			<th>Beløp</th>
      		</tr>
      	</thead>
        {inntekt.maanedligInntekter.map((alleMnd, mndIndex) => {
        	var monthSum = 0
        	return <tbody key={mndIndex}>
        	{alleMnd.inntekter.map((inntektMnd, inntektIndex) => {
        		monthSum += parseInt(inntektMnd.beloep);
        		return <tr key={inntektIndex}>
        		<td>{inntektIndex === 0 ? alleMnd.gjeldendeMaaned : ""}</td>
        		<td>{inntektMnd.type}</td>
        		<td>{inntektMnd.beskrivelse.toUpperCase()}</td>
        		<td>{inntektMnd.beloep}</td>
        		</tr>
        	})}
        	<tr><td/><td/><td>SUM</td><td>{monthSum}</td></tr>
        	</tbody>

        })}
      </table>
    )
  } else {
  	return ("")
  }
}

const søkeboksStyle = {
    marginLeft: '1em'
}

function Søkeboks({config}){
    const identSearch = useRef(null)
    const fomDato = useRef(null)
    const tomDato = useRef(null)
    const [url, setUrl] = useState(undefined)
    const {data} = useGet({url})
    const history = useHistory();

    useEffect(() => {
        if(data !== undefined){
            history.push("/person", {ident:identSearch.current.value, fomDato:fomDato.current.value, tomDato:tomDato.current.value, data})
        }
    }, [data])

    function search(value){
        const searchUrl = config.suSeBakoverUrl + "/person?ident=" + value;
        setUrl(searchUrl);
    }

    function keyTyped(e) {
        if (e.key === 'Enter') {
            search(identSearch.current.value)
        }
    }

    return (
        <>
        	<input placeholder="FNR" ref={identSearch} type="text" onKeyDown={keyTyped} />
			<label htmlFor="fom">FOM:</label>
			<input type="date" id="fom" ref={fomDato} defaultValue={new Date(new Date(new Date().setMonth(-4)).setDate(1)).toISOString().slice(0,10)}/>
			<label htmlFor="tom">TOM:</label>
			<input type="date" id="tom" ref={tomDato} defaultValue={new Date().toISOString().slice(0,10)}/>
			<Knapp onClick={() => search(identSearch.current.value)}>Søk</Knapp>
        </>
    )
}

const ContentWrapperStyle = {
    backgroundColor: '#3E3832',
    color: 'white',
    height: '3em',
    display: 'flex',
    alignItems: 'center'

}

const appNameStyle = {
    marginRight: '2em',
    marginLeft: '1em'
}


function ContentWrapper({config, children}){
    return (
        <div>
			<div style={ContentWrapperStyle}>
				<Innholdstittel style={appNameStyle}>
					NAV Suse
				</Innholdstittel>
				<Søkeboks config={config}/>
			</div>
			<div style={{display: 'flex'}}>
                <div> <Venstremeny/></div>
                <div> {children} </div>
            </div>
        </div>
    )
}

const VenstremenyStyle = {
	display: 'flex',
	border: 'none'
}

function Venstremeny(){
	return (
		<>
		<table>
			<tbody>
				<tr>
					<td><a href="/" className="knapp" style={VenstremenyStyle}>Hjem</a></td>
				</tr>
				<tr>
					<td><a href="/soknad" className="knapp" style={VenstremenyStyle}>Søknad</a></td>
				</tr>
				<tr>
					<td><a href="/saker" className="knapp" style={VenstremenyStyle}>Saker</a></td>
				</tr>
				<tr>
					<td><a href="/vilkarsprov" className="knapp" style={VenstremenyStyle}>Vilkårsprøving</a></td>
				</tr>
				<tr>
					<td><a href="/Beregning" className="knapp" style={VenstremenyStyle}>Beregning</a></td>
				</tr>
			</tbody>
		</table>
		</>
	)
}

function AuthComplete() {
    const location = useLocation()
    const {accessToken, setAccessToken} = useContext(AuthContext)
    const token = location.hash.replace("#","")
    const history = useHistory();
    setAccessToken(token)
    useEffect(() => {
        if(accessToken !== undefined){
            history.push("/")
        }
    }, [accessToken])
    return null
}

export default hot(module)(Root);
