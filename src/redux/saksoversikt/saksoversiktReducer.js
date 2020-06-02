import * as types from '../types';

const initialState = {
    saksoversikt: undefined,
    submitRequest: undefined
};

export default function(state = initialState, action) {
    console.log('action.type: ', action.type);
    switch (action.type) {
        case types.FETCH_SAKSOVERSIKT:
            return {
                ...state,
                saksoversikt: action.payload
            };

        case types.SAKSOVERSIKT_SUBMIT:
            return {
                ...state,
                submitRequest: action.payload
            };

        case types.KONTROLLSAMTALE_UPDATED:
            return {
                ...state,
                saksoversikt: action.payload
            };

        case types.UTBETALING_UPDATED:
            return {
                ...state,
                saksoversikt: action.payload
            };

        case types.SAKSNOTATER_UPDATED:
            return {
                ...state,
                saksoversikt: action.payload
            };

        case types.HENDELSE_UPDATED:
            return {
                ...state,
                saksoversikt: action.payload
            };

        default:
            return state;
    }
}
