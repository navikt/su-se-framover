import React, {useState} from "react";
import NavFrontendChevron from "nav-frontend-chevron";
import classNames from 'classnames'
import {Textarea} from "nav-frontend-skjema";
import {ExpandableDiv, ElementsContainer, GreyBoxDiv} from "./StyledComponents";
import {useDispatch, useSelector} from "react-redux";
import {saksnotaterUpdated} from "../../../redux/saksoversikt/saksoversiktActions";

const Sidepanel = () => {

    const {saksoversiktReducer} = useSelector(state => state)
    const {saksoversikt} = saksoversiktReducer;

    const aktivStønadsperiode = saksoversikt.aktivStønadsperiode

    const dispatch = useDispatch()


    const [displaySideContent, setDisplaySideContent] = useState(true);

    function handleDisplaySideContentClick(){
        displaySideContent ? setDisplaySideContent(false) : setDisplaySideContent(true);
    }

    function displayCorrectChevron(){
        if(displaySideContent){
            return (
                <div style={{height: '40px', width: '40px',
                    display: 'flex', justifyContent: 'center'
                }} onClick={() => handleDisplaySideContentClick()}>
                    <NavFrontendChevron type={'høyre'} style={{ alignSelf: 'center' }}/>
                </div>
            )
        }else{
            return  <div style={{height: '40px', width: '60px',
                display: 'flex', justifyContent: 'center'
            }} onClick={() => handleDisplaySideContentClick()}>
                <NavFrontendChevron type={'venstre'} style={{alignSelf: 'center'}}/>
            </div>
        }
    }

    const DisplayHendelser = () => {
        return aktivStønadsperiode.hendelser.map(
            hendelse => <span key={hendelse}><p>{hendelse}</p><br/></span>)
    }


    return (
        <ExpandableDiv className={classNames(
            displaySideContent ? 'open' : 'closing'
        )}>
            <div style={{display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', backgroundColor: 'rgb(233, 231, 231)'}}>
                {displayCorrectChevron()}
            </div>

            <ElementsContainer>
                <Textarea style={{maxHeight: '200px', overflowY: 'scroll'}}
                          label={"Saksnotater for aktiv stønadsperiode"}
                          value={aktivStønadsperiode.saksnotat}
                          onChange={e => dispatch(saksnotaterUpdated(e.target.value))}
                />


                <div style={{marginTop: '2em', height: '175px'}}>
                    <header>Hendelser</header>
                    <div style={{padding: '10px',backgroundColor: 'white', overflowY: 'scroll',}}>
                        <DisplayHendelser />
                    </div>
                </div>




                <GreyBoxDiv>
                    <p>Noe her?</p>
                </GreyBoxDiv>

                <GreyBoxDiv>
                    <p>Noe her?</p>
                </GreyBoxDiv>
            </ElementsContainer>

        </ExpandableDiv>
    )
};

export default Sidepanel;
