import React, { useState } from 'react';
import { Input, Radio, RadioGruppe } from 'nav-frontend-skjema';
import { getRandomSmiley } from '../hooks/getRandomEmoji';
import NavFrontendChevron from 'nav-frontend-chevron';
import Etikett from 'nav-frontend-etiketter';
import { Undertittel } from 'nav-frontend-typografi';

/*eslint no-unused-vars: */

export const InputFields = ({ id, style, labelText: label, value, onChange, bredde, disabled }) => (
    <span style={InputFieldsStyle}>
        <Input
            style={style}
            id={id}
            label={label}
            value={value}
            bredde={bredde}
            disabled={disabled}
            onChange={e => onChange(e.target.value)}
        />
    </span>
);

const InputFieldsStyle = {
    marginRight: '1em'
};

export const JaNeiSpørsmål = ({ fieldName, legend, onChange, state }) => {
    const options = [
        { label: 'Ja', value: 'true' },
        { label: 'Nei', value: 'false' }
    ];
    return (
        <RadioGruppe legend={legend}>
            {options.map(({ label, value }) => (
                <Radio
                    key={label}
                    name={fieldName}
                    label={label}
                    value={value}
                    checked={state === value}
                    onChange={onChange}
                />
            ))}
        </RadioGruppe>
    );
};

export const CollapsiblePanel = ({ ...props }) => {
    const [state, setState] = useState(false);

    const togglePanel = () => {
        setState(state => !state);
    };

    const headerStyle = {
        display: 'flex',
        justifyContent: 'space-between',
        cursor: 'pointer',
        border: 'solid 1px #f2f2f2',
        padding: '15px',
        backgroundColor: '#0089CC',
        color: '#FFF',
        fontFamily: 'verdana'
    };

    const contentStyle = {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-around',
        borderLeft: 'solid 1px #f2f2f2',
        borderRight: 'solid 1px #f2f2f2',
        borderBottom: 'solid 1px #f2f2f2',
        borderRadius: '0 0 5px 5px',
        padding: '15px',
        fontFamily: 'verdana',
        fontSize: '14px'
    };

    const sectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '30%'
    };

    const subSectionStyle = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: '1em'
    };

    const subSectionBottomMargin = {
        marginBottom: '0.5em'
    };

    return (
        <div>
            <div style={headerStyle} onClick={e => togglePanel()}>
                <div style={{ display: 'flex' }}>
                    <div style={{ marginRight: '0.5em' }}>{getRandomSmiley()}</div>

                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            marginRight: '1em'
                        }}
                    >
                        <div>
                            <span style={{ marginRight: '0.5em' }}>{props.navn}</span>
                            <span>({props.alder})</span>
                        </div>

                        <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
                            <div style={{ marginRight: '1em' }}>
                                <span>{props.fødselsnummer}</span>
                                <span>{getRandomSmiley()}</span>
                            </div>
                            <div>{props.infoTexts}</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex' }}>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            flexDirection: 'column',
                            marginRight: '1em'
                        }}
                    >
                        <div style={{ marginBottom: '1em' }}>
                            {props.etikett.length > 0
                                ? props.etikett.map(item => {
                                      return (
                                          <span key={item}>
                                              <Etikett type="fokus" style={{ marginRight: '0.5em' }}>
                                                  {item}
                                              </Etikett>
                                          </span>
                                      );
                                  })
                                : ''}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <p>Nav-kontor / ingen</p>
                        </div>
                    </div>
                    {state ? (
                        <NavFrontendChevron type={'ned'} style={{ alignSelf: 'center' }} />
                    ) : (
                        <NavFrontendChevron type={'opp'} style={{ alignSelf: 'center' }} />
                    )}
                </div>
            </div>
            {/*
            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            ////////////////////////////////////////////////////////////////////////////////////////////
            */}
            {state ? (
                <div style={contentStyle}>
                    <div style={sectionStyle}>
                        <Undertittel style={subSectionBottomMargin}>Pepperoni</Undertittel>
                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>
                                {getRandomSmiley()} info om hvor jeg bor minioverskrift
                            </span>
                            <span style={subSectionBottomMargin}>pizzaveien 5</span>
                            <span style={subSectionBottomMargin}>0798, Løk og ost</span>
                        </div>

                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>
                                {getRandomSmiley()} info om min kontaktinfo minioverskrift
                            </span>
                            <span style={subSectionBottomMargin}>22225555</span>
                            <span>pizzaspesial@pizzaoslo.pizza</span>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <Undertittel style={subSectionBottomMargin}>Kekerroni</Undertittel>
                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>
                                {getRandomSmiley()} info om sivilstand minioverskrift
                            </span>
                        </div>

                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>{getRandomSmiley()} ekstra</span>
                            <span style={subSectionBottomMargin}>
                                Den kommer med en 5 år gammel hvitløksdressing, og 2 år gammel liten brus
                            </span>
                        </div>
                    </div>

                    <div style={sectionStyle}>
                        <Undertittel style={subSectionBottomMargin}>Ripperoni</Undertittel>
                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>
                                {getRandomSmiley()} info om hvor jeg besøker minioverskrift
                            </span>
                        </div>

                        <div style={subSectionStyle}>
                            <span style={subSectionBottomMargin}>
                                {getRandomSmiley()} jeg får pizza penger fra NAV Løkka
                            </span>
                            <span style={subSectionBottomMargin}>
                                Jeg skal ha pizza-time med veileder den 25.12.2020
                            </span>
                        </div>
                    </div>
                </div>
            ) : (
                ''
            )}
        </div>
    );
};
