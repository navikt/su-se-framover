import styled, {keyframes} from "styled-components";

const animationOpen = keyframes`
  0% {
    max-width: 3%;
    width: 3%;
  }
  100% {
    max-width: 40%;
    width: 40%;
  }
`
const animationClose = keyframes`
  0% {
    max-width: 40%;
    width: 40%;
  }
  100% {
    max-width: 3%;
    width: 3%;
  }
`

export const ExpandableDiv = styled.div`
    display: flex;
    overflow: hidden;
    height: 40em;
    &.open{
        will-change: max-width, width;
        width: 40%;
        max-width: 40%;
        animation: ${animationOpen} 1s ease;
    }
    &.closing{
        will-change: max-width, width;
        width: 3%;
        max-width: 3%;
        animation: ${animationClose} 1s ease;
    }
`
export const ElementsContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%; 
    background-color: rgb(233, 231, 231);
`
export const GreyBoxDiv = styled.div`
    background-color: lightgrey;
    width: 175px; 
    height: 100px; 
    display: flex;
    align-items: center; 
    flex-direction: column; 
    justify-content: center; 
    margin: 2em;
`