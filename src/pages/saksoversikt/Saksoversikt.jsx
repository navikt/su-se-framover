import React, { useEffect, useState } from 'react';
import 'nav-frontend-tabell-style';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory } from 'react-router-dom';
import 'nav-frontend-tabell-style';
import PersonInfoBar from '../../components/PersonInfoBar';
import Sidepanel from './sidePanel/Sidepanel';
import Oversikt from './Oversikt';
import Stønadsperiode from './aktivStønadsperiode/Stønadsperiode';
import TidligereStønadsperioder from './tidligereStønadsperioder/TidligereStønadsperioder';
import './saksoversikt.less';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSaksoversikt, submitSaksoversikt } from '../../redux/saksoversikt/saksoversiktActions';
import { AlertStripeSuksess } from 'nav-frontend-alertstriper';

function Saksoversikt() {
    const dispatch = useDispatch();
    const { saksoversiktReducer } = useSelector(state => state);
    const { saksoversikt, submitRequest } = saksoversiktReducer;
    const history = useHistory();
    const [pageToRender, setPageToRender] = useState(1);
    const [state, setState] = useState(undefined);
    let sak = history.location.state;

    useEffect(() => {
        if (!saksoversikt) {
            dispatch(fetchSaksoversikt());
        }
    }, [saksoversikt]);

    useEffect(() => {
        if (saksoversikt) {
            setState(saksoversikt);
        }
    }, [saksoversikt]);

    console.log(state);

    const renderActivePage = () => {
        if (pageToRender === 1) {
            return <Oversikt state={state.aktivStønadsperiode} />;
        } else if (pageToRender === 2) {
            return <Stønadsperiode state={state} />;
        } else if (pageToRender === 3) {
            return <TidligereStønadsperioder tidligereStønadsperioderState={state.tidligereStønadsperioder} />;
        }
    };

    return (
        <div className="saksoversikt">
            <div className="mainContent" style={{ display: 'flex' }}>
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <div>
                        <PersonInfoBar />
                    </div>
                    <div className="mainSection" style={{ marginBottom: '1em' }}>
                        <div
                            className="NAVBar"
                            style={{ border: 'solid 1px', backgroundColor: 'rgb(233, 231, 231)', padding: '0.5em' }}
                        >
                            <ul style={{ display: 'flex', justifyContent: 'space-around' }}>
                                <li style={{ fontWeight: 'bold' }} onClick={() => setPageToRender(1)}>
                                    Oversikt
                                </li>
                                <li style={{ fontWeight: 'bold' }} onClick={() => setPageToRender(2)}>
                                    Aktiv Stønadsperiode
                                </li>
                                <li style={{ fontWeight: 'bold' }} onClick={() => setPageToRender(3)}>
                                    tidligere stønadsperioder
                                </li>
                            </ul>
                        </div>
                    </div>
                    {state ? renderActivePage() : ''}
                </div>
                {state ? <Sidepanel state={state.aktivStønadsperiode} /> : ''}
            </div>
            <Hovedknapp style={{ marginRight: '1em' }} onClick={() => dispatch(submitSaksoversikt(state))}>
                Lagre
            </Hovedknapp>
            <Hovedknapp onClick={() => history.push('/vilkarsprov', (sak = { sak }))}>Til vikkårsprøving</Hovedknapp>
            <div>{submitRequest ? <AlertStripeSuksess>{submitRequest}</AlertStripeSuksess> : ''}</div>
        </div>
    );
}

export default Saksoversikt;
