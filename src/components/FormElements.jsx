import React from "react";
import {Input} from 'nav-frontend-skjema';

export const InputFields = ({labelText, value, onChange}) => (
        <span style={InputFieldsStyle}>
            <Input label={labelText} value={value} onChange={(e => onChange(e.target.value))}/>
        </span>
    )

const InputFieldsStyle = {
    marginRight: '1em'
}
