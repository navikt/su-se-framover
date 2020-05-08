import styled, {keyframes} from "styled-components";
import Undertittel from "nav-frontend-typografi/lib/undertittel";

const animationOpen = keyframes`
  0% {
    max-height: 0;
    height: 0;
  }
  100% {
    max-height: 20em;
    height: 100%;
  }
`
const animationClose = keyframes`
  0% {
    max-height: 20em;
    height: 100%;
  }
  100% {
    max-height: 0;
    height: 0%;
  }
`
export const StyledDiv = styled.div`
    display: flex;
    justify-content: space-around;
    overflow: hidden;
    &.open{
        will-change: height;
        height: 100%;
        animation: ${animationOpen} 1s ease;
    }
    &.closing{
        will-change: max-height, height;
        max-height: 0;
        height: 0%;
        animation: ${animationClose} 1s ease;
    }
    &.closed{
        height: 0;
        max-height: 0;
    }
`
export const HeaderDiv = styled.div`
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    border: solid 1px #f2f2f2;
    padding: 15px;
    background-color: lightgrey;
    color: black;
    font-family: verdana;
`
export const HeaderRow = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    margin-right: 1em;
`
export const Section = styled.div`
    display: flex; 
    justify-content: flex-start; 
    flex-direction: column;
`
export const FlexDiv = styled.div`
    display: flex;
`
export const MarginBottomDiv = styled.div`
    margin-bottom: 1em;
`
export const TextHeader = styled.p`
    font-size: 14px;
     font-weight: bold;
`
export const UndertittelStyled = styled(Undertittel)`
    margin-bottom: 0.5em;
     align-self: center;
`

