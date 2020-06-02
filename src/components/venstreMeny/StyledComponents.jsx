import { Link } from 'react-router-dom';
import styled, {keyframes} from "styled-components";

const animationOpen = keyframes`
  0% {
    max-width: 4.5em;
    width: 100%;
  }
  100% {
    max-width: 15em;
    width: 100%;
  }
`
const animationClose = keyframes`
  0% {
    max-width: 15em;
    width: 100%;
  }
  100% {
    max-width: 4.5em;
    width: 100%;
  }
`
export const ExpandableDiv = styled.div`
    display: flex;
    justify-content: flex-start;
    flex-direction: column;
    overflow: hidden;
    &.open{
        will-change: width;
        width: 100%;
        animation: ${animationOpen} 1s ease;
    }
    &.closing{
        will-change: max-width, width;
        max-width: 4.5em;
        width: 100%;
        animation: ${animationClose} 1s ease;
    }
    &.closed{
        max-width: 4.5em;
        width: 100%;
    }
`
export const LinkStyled = styled(Link)`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  font-weight: 600;
  white-space: nowrap;
  letter-spacing: 0.0625em;
  line-height: 1.375rem;
  text-transform: uppercase;
  text-decoration: none;
  padding: 1em;
  color: #0067C5;

    &:hover {
      background-color: #0067C5;
      color: white;
    }
`
export const MarginRightSpan = styled.span`
    margin-right: 1.5em;
`
