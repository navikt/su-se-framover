import React from "react";
import "./CalendarProgressBar.less"

export const CalendarProgressBar = ({startPeriode, datoIDag, sluttPeriode}) => {

    let timeBetweenTodayAndStart = datoIDag-startPeriode
    let timeBetweenEndAndStart = sluttPeriode-startPeriode;

    function generateBarStyle(){
        let greenWidth = (timeBetweenTodayAndStart/timeBetweenEndAndStart)*100;
        let background = "linear-gradient(to right, lightgreen 0%, lightgreen " + greenWidth + "%, lightblue " + greenWidth + "%)";

        //so the colour doesnt continue growing outside the window
        // >100% should return a default orange colour to indicate the period is over
        if(greenWidth >= 100){
            background = "linear-gradient(to right, orange 0%, orange 100%)";
        }

        return {
            position: "relative",
            width: '100%',
            height: '30px',
            background: background
        }
    }

    function makeMonthArray(){
        const loopStart = startPeriode.getMonth();
        const loopEnd = startPeriode.getMonth()+12;

        const monthsArray = []
        for(let i = loopStart; i < loopEnd; i++){
            let monthNum = 0 + i;
            let month = new Date(new Date().getFullYear(), monthNum, 1)
            const x = month.toLocaleDateString('default', {month: 'long'})
            monthsArray.push(x)
        }
        return monthsArray;
    }

    const showMonths = () => {
        const someArr = []
        const monthArr = makeMonthArray();

        for(let i = 0; i < 12; i++){
            let monthLabel = {
                "class": "tick",
                "text": monthArr[i],
                "css": {
                    position: 'absolute',
                    width: (1/12)*100 + "%",
                    left: (1/12)*i*100 + "%",
                    display: 'inline-block',
                    textAlign: 'center',
                    lineHeight: '30px',
                    height: '100%'
                }
            }
            someArr.push(monthLabel)
        }

        return (
            <div className="progress">
                {someArr.map(i => (
                    <span key={i.text} className={i.class} style={i.css}>{i.text}</span>
                ))}
            </div>
        )
    }

    return (
        <div style={{backgroundColor: 'lightgrey'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', margin: '1em'}}>
                <p>Stønad innvilget: {startPeriode.getDate()} {startPeriode.getMonth()+1} {startPeriode.getFullYear()}</p>
                <p>Dato i dag: {datoIDag.getDate()} {datoIDag.getMonth()+1} {datoIDag.getFullYear()}</p>
                <p>Stønad slutt: {sluttPeriode.getDate()} {sluttPeriode.getMonth()+1} {sluttPeriode.getFullYear()}</p>
            </div>
            <div style={generateBarStyle()}>
                {showMonths()}
            </div>
        </div>
    )
}
