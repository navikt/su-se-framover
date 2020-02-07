import React from "react";
import {Input} from 'nav-frontend-skjema';

export const InputFields = ({id, style, labelText:label, value, onChange, bredde}) => (
        <span style={InputFieldsStyle}>
            <Input style={style} id={id} label={label} value={value} bredde={bredde} onChange={(e => onChange(e.target.value))} />
        </span>

)

const InputFieldsStyle = {
    marginRight: '1em',
}
