import React from "react";

const Oversikt = ({state}) => {

    return (
        <div>
            <div style={{display: 'flex', justifyContent: 'center'}}>
                <p style={{fontSize: '18px', fontWeight: 'bold', marginBottom:'1em'}}>Sak-id: 555 088 322</p>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-around'}}>
                <div style={boksStyle}>
                    <p>Neste kontrollsamtale:</p>
                    <p>22-08-2020</p>
                </div>

                <div style={boksStyle}>
                    <p>Neste utbetaling:</p>
                    <p>01.04.2020</p>
                </div>

                <div style={boksStyle}>
                    <p>Utbetaling stoppet:</p>
                    <p>1</p>
                </div>
            </div>
        </div>
    )
};

const boksStyle = {
    backgroundColor: 'lightgrey',
    width: '175px',
    height: '100px',
    display:'flex',
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: '2em'
}


export default Oversikt;