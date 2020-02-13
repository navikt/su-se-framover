import { Link } from 'react-router-dom';
import React from 'react';

export const Venstremeny = () => {
    return (
        <>
            <Link to="/" className="knapp" style={VenstremenyStyle}>
                Hjem
            </Link>
            <Link to="/soknad" className="knapp" style={VenstremenyStyle}>
                Søknad
            </Link>
            <Link to="/saker" className="knapp" style={VenstremenyStyle}>
                Saker
            </Link>
            <Link to="/vilkarsprov" className="knapp" style={VenstremenyStyle}>
                Vilkårsprøving
            </Link>
            <Link to="/Beregning" className="knapp" style={VenstremenyStyle}>
                Beregning
            </Link>
        </>
    );
};

const VenstremenyStyle = {
    display: 'flex',
    border: 'none'
};

export default Venstremeny;
