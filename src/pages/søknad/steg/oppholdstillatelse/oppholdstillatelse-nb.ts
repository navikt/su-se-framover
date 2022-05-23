import { TypeOppholdstillatelse } from '~src/features/søknad/types';

export const typeOppholdstillatelse: { [key in TypeOppholdstillatelse]: string } = {
    [TypeOppholdstillatelse.Midlertidig]: 'Midlertidig',
    [TypeOppholdstillatelse.Permanent]: 'Permanent',
};

export default {
    ...typeOppholdstillatelse,
    'statsborger.label': 'Er du norsk statsborger eller statsborger i et annet nordisk land?',
    'statsborger.description':
        'Nordiske land er Danmark, Norge, Sverige, Finland og Island, samt Færøyene, Grønland og Åland',
    'eøsborger.label': 'Er du EØS-borger eller familiemedlem til en EØS-borger?',
    'eøsborger.info':
        'Som EØS-borger må du legge ved varig oppholdsbevis i Norge. Har du kun registreringbevis, må du søke om varig oppholdbevis ved det lokale politidistriktet ditt.',
    'oppholdstillatelse.label': 'Har du oppholdstillatelse i Norge?',
    'oppholdstillatelse.info':
        'For å ha rett til supplerende stønad må du ha norsk statsborgerskap eller oppholdstillatelse i Norge. Du fremdeles søke, men vil sannsynligvis få avslag.',
    'familieforening.label':
        'Kom du til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller niese, og fikk oppholdstillatelse med krav til underhold?',
    'familieforening.info':
        'Hvis du kom til Norge på grunn av familiegjenforening med barn, barnebarn, nevø eller niese og fikk oppholdstillatelse med krav til underhold, vil du ikke ha rett til supplerende stønad.  Du kan fremdeles søke, men vil sannsynligvis få avslag.',
    'typeOppholdstillatelse.label': 'Er oppholdstillatelsen din permanent eller midlertidig?',
    'typeOppholdstillatelse.info':
        'Hvis den midlertidige oppholdstillatelsen din opphører i løpet av de tre neste månedene bør du fornye oppholdstillatelsen din. Hvis oppholdstillatelsen din opphører, mister du retten på supplerende stønad.',
    'statsborgerskapAndreLand.label': 'Har du statsborgerskap i andre land?',
    'statsborgerskapAndreLandFritekst.label': 'Hvilke land har du statsborgerskap i?',
};
