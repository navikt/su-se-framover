import { CalendarProgressBar } from '../../../components/calendarProgressBar/CalendarProgressBar';
import React, { useState } from 'react';
import { makeDate } from '../../../HelperFunctions';
import TidligereKontrollsamtaler from './TidligereKontrollsamtaler';
import TidligereUtbetalinger from './TidligereUtbetalinger';
import TidligereDokumentasjon from './TidligereDokumenter';
import styled, { keyframes } from 'styled-components';
import classNames from 'classnames';

const animationOpen = keyframes`
  0% {
    max-height: 0;
    height: 0%;
  }
  100% {
    max-height: 30em;
    height: 100%;
  }
`;
const animationClose = keyframes`
  0% {
    max-height: 30em;
    height: 100%;
  }
  100% {
    max-height: 0;
    height: 0%;
  }
`;
const StyledDiv = styled.div`
    overflow: hidden;
    &.open {
        will-change: max-height, height;
        height: 100%;
        max-height: 100%;
        animation: ${animationOpen} 1s ease;
    }
    &.closing {
        will-change: max-height, height;
        height: 0;
        max-height: 0%;
        animation: ${animationClose} 1s ease;
    }
    &.closed {
        height: 0;
        max-height: 0%;
    }
`;
const StønadsperiodeContainer = styled.div`
    display: flex;
    flex-direction: column;
    background-color: rgb(233, 231, 231);
    margin-bottom: 1em;
`;

const ContainerHeader = styled.div`
    display: flex;
    justify-content: center;
`;

const TidligereStønadsperioder = ({ tidligereStønadsperioderState }) => {
    const date = new Date();

    const displayTidligereStønadsPerioder = (element, index) => {
        const [openStønad, setOpenStønad] = useState(false);
        const [firstRender, setFirstRender] = useState(true);

        const firstRenderDone = () => {
            setFirstRender(false);
        };

        const showStønad = () => {
            firstRenderDone();
            setOpenStønad(!openStønad);
        };

        return (
            <StønadsperiodeContainer>
                <ContainerHeader onClick={() => showStønad()}>
                    <p>Stønadsperiode {index}</p>
                </ContainerHeader>
                <StyledDiv className={classNames(firstRender ? 'closed' : openStønad ? 'open' : 'closing')}>
                    <div>
                        <div>
                            <CalendarProgressBar
                                startPeriode={makeDate(element.datoer.startDato)}
                                datoIDag={new Date(date.getFullYear(), date.getMonth(), date.getDate())}
                                sluttPeriode={makeDate(element.datoer.sluttDato)}
                            />
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                justifyContent: 'space-around',
                                marginBottom: '1em',
                                marginTop: '1em'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {TidligereKontrollsamtaler(element.kontrollsamtaler)}
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    {TidligereDokumentasjon(element.dokumenter, element.saksnotat)}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                                {TidligereUtbetalinger(element.utbetalinger)}
                            </div>
                        </div>
                    </div>
                </StyledDiv>
            </StønadsperiodeContainer>
        );
    };

    return (
        <div>
            {tidligereStønadsperioderState.map((element, index) => {
                return displayTidligereStønadsPerioder(element, index + 1);
            })}
        </div>
    );
};

export default TidligereStønadsperioder;
