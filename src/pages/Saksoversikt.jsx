import React from 'react';
import 'nav-frontend-tabell-style';
import { Hovedknapp } from 'nav-frontend-knapper';
import { useHistory } from 'react-router-dom';
import 'nav-frontend-tabell-style';
import PersonInfoBar from '../components/PersonInfoBar';

function Saksoversikt() {
    const history = useHistory();
    var sak = history.location.state;
    console.log(sak);
    return (
        <>
            <PersonInfoBar fnr={sak.fnr} />
            <Hovedknapp onClick={() => history.push('/vilkarsprov', (sak = { sak }))}>Behandle</Hovedknapp>
            {/*                                                         Behandle krav */}
            {/*                                                     </Hovedknapp> */}
            {/*             {sak.stonadsperioder.map((periode, index) => { */}
            {/*                 return ( */}
            {/*                     <Ekspanderbartpanel */}
            {/*                         tittel={ */}
            {/*                             <div> */}
            {/*                                 {periode.fom}-{periode.tom} */}
            {/*                             </div> */}
            {/*                         } */}
            {/*                         border */}
            {/*                         key={index} */}
            {/*                         apen={index == 0} */}
            {/*                     > */}
            {/*                         <Panel border> */}
            {/*                             <Undertittel>Krav</Undertittel> */}
            {/*                             <table className="tabell"> */}
            {/*                                 <thead> */}
            {/*                                     <tr> */}
            {/*                                         <th>Type</th> */}
            {/*                                         <th>Dato</th> */}
            {/*                                         <th></th> */}
            {/*                                     </tr> */}
            {/*                                 </thead> */}
            {/*                                 <tbody> */}
            {/*                                     {periode.krav.map((krav, i) => { */}
            {/*                                         return ( */}
            {/*                                             <tr key={i}> */}
            {/*                                                 <td>{krav.type}</td> */}
            {/*                                                 <td>{krav.mottatt}</td> */}
            {/*                                                 <td> */}
            {/*                                                     <Hovedknapp onClick={() => history.push('/vilkarsprov')}> */}
            {/*                                                         Behandle krav */}
            {/*                                                     </Hovedknapp> */}
            {/*                                                 </td> */}
            {/*                                             </tr> */}
            {/*                                         ); */}
            {/*                                     })} */}
            {/*                                 </tbody> */}
            {/*                             </table> */}

            {/*                             <Undertittel>Vedtak</Undertittel> */}
            {/*                             <table className="tabell"> */}
            {/*                                 <thead> */}
            {/*                                     <tr> */}
            {/*                                         <th>Status</th> */}
            {/*                                         <th>Dato</th> */}
            {/*                                         <th></th> */}
            {/*                                     </tr> */}
            {/*                                 </thead> */}
            {/*                                 <tbody> */}
            {/*                                     {periode.vedtak.map((vedtak, i) => { */}
            {/*                                         return ( */}
            {/*                                             <tr key={i}> */}
            {/*                                                 <td>{vedtak.status}</td> */}
            {/*                                                 <td>{vedtak.årsak}</td> */}
            {/*                                                 <td> */}
            {/*                                                     <Hovedknapp onClick={() => history.push('/vilkarsprov')}> */}
            {/*                                                         Se vedtak */}
            {/*                                                     </Hovedknapp> */}
            {/*                                                 </td> */}
            {/*                                             </tr> */}
            {/*                                         ); */}
            {/*                                     })} */}
            {/*                                 </tbody> */}
            {/*                             </table> */}
            {/*                         </Panel> */}
            {/*                     </Ekspanderbartpanel> */}
            {/*                 ); */}
            {/*             })} */}
        </>
    );
}

export default Saksoversikt;
