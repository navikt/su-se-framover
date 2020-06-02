import * as types from '../types'

export const fetchSaksoversikt = () => {
    return dispatch => {
        return dispatch({
            type: types.FETCH_SAKSOVERSIKT,
            payload: saksoversikt
        })
    }
}

export const submitSaksoversikt = payload => {
    return dispatch => {
        return dispatch({
            type: types.SAKSOVERSIKT_SUBMIT,
            payload: "success"
        })
    }
}

export const kontrollSamtaleUpdated = newDateObject => {
    return (dispatch, getState) => {
        const currentKontrollSamtaler = getState().saksoversiktReducer.saksoversikt.aktivStønadsperiode.kontrollsamtaler
        const updatedKontrollsamtaler = currentKontrollSamtaler
            .map((n, idx) => idx === newDateObject.index ?  newDateObject.value : n)

        const updatedSaksoversikt = {
            ...saksoversikt,
            aktivStønadsperiode: {
                ...saksoversikt.aktivStønadsperiode,
                kontrollsamtaler: updatedKontrollsamtaler
            }
        }

        return dispatch({
            type: types.KONTROLLSAMTALE_UPDATED,
            payload: updatedSaksoversikt
        })
    }
}

export const utbetalingUpdated = newStatusObject => {
    return (dispatch, getState) => {
        const currentUtbetalinger = getState().saksoversiktReducer.saksoversikt.aktivStønadsperiode.utbetalinger;

        const updatedUtbetalinger = currentUtbetalinger
            .map((n, idx) => idx === newStatusObject.index ? {...n, status: newStatusObject.status} : n)

        const updatedSaksoversikt = {
            ...saksoversikt,
            aktivStønadsperiode: {
                ...saksoversikt.aktivStønadsperiode,
                utbetalinger: updatedUtbetalinger
            }
        }

        console.log("Fra utbetaling", updatedSaksoversikt)

        return dispatch({
            type: types.UTBETALING_UPDATED,
            payload: updatedSaksoversikt
        })
    }
}

export const saksnotaterUpdated = value => {
    return dispatch => {

      const updatedSaksoversikt = {
        ...saksoversikt,
        aktivStønadsperiode: {
          ...saksoversikt.aktivStønadsperiode,
          saksnotat: value
        }
      }

      return dispatch({
        type: types.SAKSNOTATER_UPDATED,
        payload: updatedSaksoversikt
      })
    }

}

// ex: {typeOfHendelse: "utbetalingUpdated", newStatus: status, index: index }
// ex: {typeOfHendelse: "kontrollSamtaleUpdated", previousDate: '...', newDate: '...' }
export const hendelseUpdated = hendelseObject => {

    return (dispatch, getState) => {
        const saksoversikt = getState().saksoversiktReducer.saksoversikt

        if(hendelseObject.typeOfHendelse === "utbetalingUpdated"){
            const currentHendelser = getState().saksoversiktReducer.saksoversikt.aktivStønadsperiode.hendelser

            const textStatus = hendelseObject.newStatus === "stoppet" ? "stoppet" : "aktiverte"

            const utbetalingThatWasUpdated = currentHendelser
            .filter((n, idx) => idx === hendelseObject.index)

            const updatedHendelser = [
                `${new Date().toString()}: Agent Smith ${textStatus} utbetaling for ${utbetalingThatWasUpdated}`,
                ...currentHendelser
            ]

            const updatedSaksoversikt = {
                ...saksoversikt,
                aktivStønadsperiode: {
                    ...saksoversikt.aktivStønadsperiode,
                        hendelser: updatedHendelser
                }
            }

            console.log("Fra hendelser",updatedSaksoversikt)
            return dispatch({
                type: types.HENDELSE_UPDATED,
                payload: updatedSaksoversikt
            })

        }else if(hendelseObject.typeOfHendelse === "kontrollSamtaleUpdated"){
            console.log("kontrollsamtale hendelse")
        }
        console.log("default hendelse")
        return dispatch({
            type: types.HENDELSE_UPDATED,
            payload: saksoversikt
        })

    }

}



const jsonSøknad = { personopplysninger: { fnr: "12345678910",  fornavn: "kake",  mellomnavn: "kjeks", etternavn: "mannen", telefonnummer: "12345678", gateadresse: "gaten", postnummer: "0050", poststed: "Oslo", bruksenhet: "50", bokommune: "Oslo", flyktning: true, borFastINorge: true, statsborgerskap: "NOR"}, boforhold: {delerBolig: true, borSammenMed: ["Ektefelle/Partner/Samboer", "Andre personer over 18 år"], delerBoligMed: [{fnr: "12345678910", navn: "voksen jensen"}, {fnr: "10987654321", navn: "voksen hansen"}]}, utenlandsopphold: {utenlandsopphold: true, antallRegistrerteDager: 11, registrertePerioder: [{utreisedato: "2020-03-10", innreisedato: "2020-03-10"}], planlagteUtenlandsopphold: true, antallPlanlagteDager: 10, planlagtePerioder: [{utreisedato: "2020-06-01", innreisedato: "2020-06-20"}]}, oppholdstillatelse: {harVarigOpphold: false, utløpsdato: "2020-03-10", søktOmForlengelse: true}, inntektPensjonFormue: {framsattKravAnnenYtelse: true, framsattKravAnnenYtelseBegrunnelse: "annen ytelse begrunnelse", harInntekt: true, inntektBeløp: 2500, harPensjon: true, pensjonsOrdning: [{ordning: "KLP", beløp: 2000}, {ordning: "SPK", beløp: 5000}], sumInntektOgPensjon: 7000, harFormueEiendom: true, harFinansFormue: true, formueBeløp: 1000, harAnnenFormue: true, annenFormue: [{typeFormue: "juveler", skattetakst: 2000}]}, forNav: {målform: "Bokmål", søkerMøttPersonlig: true, harFullmektigMøtt: false, erPassSjekket: true, merknader: "intet å bemerke"}};

const saksoversikt = {
    aktivStønadsperiode: {
        hendelser: [
            "25.05.2020: Agent smith stoppet utbetaling for 01.03.2020",
            "20.05.2020: Bruker lastet opp en fil"
    ],
        datoer: {startDato: '2020-05-01', sluttDato: '2021-05-01'},
        kontrollsamtaler: [
            "2020-08-22",
            "2020-12-31"
        ],
        utbetalinger: [
            {beløp: 15250, status: "Utbetalt", datoForUtbetaling: "01.01.2020"},
            {beløp: 15250, status: "Utbetalt", datoForUtbetaling: "01.02.2020"},
            {beløp: 15250, status: "stoppet", datoForUtbetaling: "01.03.2020"},
            {beløp: 15250, status: "aktiv", datoForUtbetaling: "01.04.2020"},
            {beløp: 15250, status: "aktiv", datoForUtbetaling: "01.05.2020"},
            {beløp: 15250, status: "aktiv", datoForUtbetaling: "01.06.2020"},
            {beløp: 15250, status: "aktiv", datoForUtbetaling: "01.07.2020"},
            {beløp: 15250, status: "aktiv", datoForUtbetaling: "01.08.2020"},
        ],
        dokumenter: [
            {navn: "søknad", innhold: jsonSøknad},
            {navn: "DokumentNavn_1", innhold: "https://media1.tenor.com/images/a87e5771cfac2220cc585bb7ea847d75/tenor.gif?itemid=5650635"},
            {navn: "DokumentNavn_2", innhold: "https://media.giphy.com/media/l3q2TGhB8qZhs1tny/giphy.gif"}
        ],
        saksnotat: "Veldig fin saksoversikts skjermbilde. jeg kan ikke vente til jeg kommer til å jobbe med den."
    },
    tidligereStønadsperioder: [
        {
            datoer: {startDato: "2015-06-22", sluttDato: "2016-06-22"},
            kontrollsamtaler: [
                "2015-08-22",
                "2016-10-20"
            ],
            utbetalinger: [
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.01.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.02.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.03.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.04.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.05.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.06.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.07.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.08.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.09.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.10.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.11.2020"},
                {beløp: 12500, status: "utbetalt", datoForUtbetaling: "01.12.2020"},
            ],
            dokumenter: [
                {navn: "søknad", innhold: jsonSøknad},
                {navn: "flybilletter", innhold: "https://media.giphy.com/media/l0Iyau7QcKtKUYIda/giphy.gif"},
                {navn: "passfoto", innhold: "https://media.giphy.com/media/l3q2TGhB8qZhs1tny/giphy.gif"}
            ],
            saksnotat: "*hemmelig informasjon hemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjonhemmelig informasjon*"
        },
        {
            datoer: {startDato: "2010-06-22", sluttDato: "2011-06-22"},
            kontrollsamtaler: [
                "2010-10-09",
                "2011-11-18"
            ],
            utbetalinger: [
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.01.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.02.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.03.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.04.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.05.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.06.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.07.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.08.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.09.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.10.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.11.2020"},
                {beløp: 9500, status: "utbetalt", datoForUtbetaling: "01.12.2020"},
            ],
            dokumenter: [
                {navn: "søknad", innhold: jsonSøknad},
                {navn: "flybilletter", innhold: "https://media.giphy.com/media/l0Iyau7QcKtKUYIda/giphy.gif"},
                {navn: "passfoto", innhold: "https://media.giphy.com/media/l3q2TGhB8qZhs1tny/giphy.gif"}
            ],
            saksnotat: "*hemmeligere informasjon*"
        }
    ]
}
