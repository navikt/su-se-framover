import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import { Hamburgerknapp } from 'nav-frontend-ikonknapper';
import { getRandomSmiley } from '../hooks/getRandomEmoji';
import styled, { keyframes } from 'styled-components';
import classNames from 'classnames';
import { ApplicationIcon, CalculatorIcon, HomeIcon } from '../assets/Icons';

const animationOpen = keyframes`
  0% {
    max-width: 3.5em;
    width: 100%;
  }
  100% {
    max-width: 15em;
    width: 100%;
  }
`;
const animationClose = keyframes`
  0% {
    max-width: 15em;
    width: 100%;
  }
  100% {
    max-width: 3.5em;
    width: 100%;
  }
`;
export const ExpandableDiv = styled.div`
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    overflow: hidden;
    &.open {
        will-change: width;
        width: 100%;
        animation: ${animationOpen} 1s ease;
    }
    &.closing {
        will-change: max-width, width;
        max-width: 3.5em;
        width: 100%;
        animation: ${animationClose} 1s ease;
    }
    &.closed {
        max-width: 3.5em;
        width: 100%;
    }
`;
const LinkStyled = styled(Link)`
    display: 'flex';
    align-items: center;
    justify-content: 'flex-start';
    font-weight: 600;
    white-space: nowrap;
    letter-spacing: 0.0625em;
    line-height: 1.375rem;
    text-transform: uppercase;
    text-decoration: none;
    padding: 1em;
    color: #0067c5;

    &:hover {
        background-color: #0067c5;
        color: white;
    }
`;
const MarginRightSpan = styled.span`
    margin-right: 1.5em;
`;

//TODO: Fiks størrelse på ikoner. må graves litt dypere inn i
export const Venstremeny = () => {
    const [expand, setExpand] = useState(false);
    const [firstRender, setFirstRender] = useState(true);

    const firstRenderDone = () => {
        setFirstRender(false);
    };
    function handleExpandClick() {
        firstRenderDone();
        expand ? setExpand(false) : setExpand(true);
    }

    return (
        <ExpandableDiv className={classNames(firstRender ? 'closed' : expand ? 'open' : 'closing')}>
            <Hamburgerknapp kompakt={true} onClick={() => handleExpandClick()} style={{ padding: '1em' }} />
            <LinkStyled to="/">
                <MarginRightSpan>{HomeIcon()}</MarginRightSpan>
                <span>Hjem</span>
            </LinkStyled>
            <LinkStyled to="/soknad">
                <MarginRightSpan>{ApplicationIcon()}</MarginRightSpan>
                <span>Søknad</span>
            </LinkStyled>
            <LinkStyled to="/saker">
                <MarginRightSpan>{getRandomSmiley()}</MarginRightSpan>
                <span>Saker</span>
            </LinkStyled>
            <LinkStyled to="/vilkarsprov">
                <MarginRightSpan>{getRandomSmiley()}</MarginRightSpan>
                <span>Vilkårsprøving</span>
            </LinkStyled>
            <LinkStyled to="/Beregning">
                <MarginRightSpan>{CalculatorIcon()}</MarginRightSpan>
                <span>Beregning</span>
            </LinkStyled>
            <LinkStyled to="/saksoversikt">
                <MarginRightSpan>{getRandomSmiley()}</MarginRightSpan>
                <span>Saksoversikt</span>
            </LinkStyled>
        </ExpandableDiv>
    );
};

export default Venstremeny;
