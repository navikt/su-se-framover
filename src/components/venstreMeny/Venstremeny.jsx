import React, {useState} from 'react';
import { Hamburgerknapp } from 'nav-frontend-ikonknapper';
import classNames from "classnames";
import {ApplicationIcon, CalculatorIcon, HomeIcon, FileView, CheckListIcon, StackedDocumentsIcon} from "../../assets/Icons";
import {ExpandableDiv, LinkStyled, MarginRightSpan} from "./StyledComponents";

//TODO: Fiks størrelse på ikoner. må graves litt dypere inn i
export const Venstremeny = () => {
    const [expand, setExpand] = useState(false);
    const [firstRender, setFirstRender] = useState(true)

    const firstRenderDone = () => {
        setFirstRender(false);
    };
    const handleExpandClick = () => {
        firstRenderDone();
        expand ? setExpand(false) : setExpand(true);
    }


    return (
        <ExpandableDiv className={classNames(
            firstRender ? "closed" :
                expand ? 'open' : 'closing'
        )}>
                <Hamburgerknapp kompakt={true} onClick={() => handleExpandClick()} style={{padding: '1em'}}/>
                <LinkStyled to="/" >
                    <MarginRightSpan>{HomeIcon(35)}</MarginRightSpan>
                    <span>Hjem</span>
                </LinkStyled>
                <LinkStyled to="/soknad">
                    <MarginRightSpan>{ApplicationIcon()}</MarginRightSpan>
                    <span>Søknad</span>
                </LinkStyled>
                <LinkStyled to="/saker">
                    <MarginRightSpan>{StackedDocumentsIcon(35)}</MarginRightSpan>
                    <span>Saker</span>
                </LinkStyled>
                <LinkStyled to="/vilkarsprov">
                    <MarginRightSpan>{CheckListIcon()}</MarginRightSpan>
                    <span>Vilkårsprøving</span>
                </LinkStyled>
                <LinkStyled to="/Beregning">
                    <MarginRightSpan>{CalculatorIcon()}</MarginRightSpan>
                    <span>Beregning</span>
                </LinkStyled>
                <LinkStyled to="/saksoversikt">
                    <MarginRightSpan>{FileView()}</MarginRightSpan>
                    <span>Saksoversikt</span>
                </LinkStyled>


        </ExpandableDiv>
    )
};


export default Venstremeny;
