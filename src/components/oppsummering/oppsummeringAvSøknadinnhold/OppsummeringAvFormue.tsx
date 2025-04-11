import { useI18n } from '~src/lib/i18n';
import { Nullable } from '~src/lib/types';
import { Formue } from '~src/types/Søknadinnhold';

import { FormueTrippel } from '../oppsummeringAvVilkårOgGrunnlag/OppsummeringAvFormue';

import messages from './OppsummeringAvSøknadinnhold-nb';

const OppsummeringAvFormue = (props: {
    formue: {
        søkers: Formue;
        eps?: Nullable<Formue>;
    };
}) => {
    const { formatMessage } = useI18n({ messages });

    return (
        <div>
            <FormueTrippel
                label={''}
                søkersVerdi={formatMessage('formue.heading.søker')}
                epsverdi={props.formue.eps ? formatMessage('formue.heading.eps') : undefined}
            />
            <FormueTrippel
                label={formatMessage('formue.verdiPåBolig')}
                søkersVerdi={props.formue.søkers.verdiPåBolig ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps?.verdiPåBolig ?? 0) : null}
            />
            <FormueTrippel
                label={formatMessage('formue.verdiPåEiendom')}
                søkersVerdi={props.formue.søkers.verdiPåEiendom ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps?.verdiPåEiendom ?? 0) : null}
            />
            {props.formue.søkers.kjøretøy?.map((kjøretøy) => (
                <FormueTrippel
                    key={kjøretøy.kjøretøyDeEier}
                    label={`${formatMessage('formue.verdiPåKjøretøy')} (${kjøretøy.kjøretøyDeEier})`}
                    søkersVerdi={kjøretøy.verdiPåKjøretøy}
                    epsverdi={props.formue.eps ? '-' : null}
                />
            ))}
            {props.formue.eps?.kjøretøy?.map((kjøretøy) => (
                <FormueTrippel
                    key={kjøretøy.kjøretøyDeEier}
                    label={`${formatMessage('formue.verdiPåKjøretøy')} (${kjøretøy.kjøretøyDeEier})`}
                    søkersVerdi={'-'}
                    epsverdi={kjøretøy.verdiPåKjøretøy}
                />
            ))}
            <FormueTrippel
                label={formatMessage('formue.innskuddsbeløp')}
                søkersVerdi={props.formue.søkers.innskuddsBeløp ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps.innskuddsBeløp ?? 0) : null}
            />
            <FormueTrippel
                label={formatMessage('formue.verdipapirbeløp')}
                søkersVerdi={props.formue.søkers.verdipapirBeløp ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps.verdipapirBeløp ?? 0) : null}
            />
            <FormueTrippel
                label={formatMessage('formue.skylderNoenSøkerPengerBeløp')}
                søkersVerdi={props.formue.søkers.skylderNoenMegPengerBeløp ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps.skylderNoenMegPengerBeløp ?? 0) : null}
            />
            <FormueTrippel
                label={formatMessage('formue.kontanter')}
                søkersVerdi={props.formue.søkers.kontanterBeløp ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps?.kontanterBeløp ?? 0) : null}
            />
            <FormueTrippel
                label={formatMessage('formue.depositumsBeløp')}
                søkersVerdi={props.formue.søkers.depositumsBeløp ?? 0}
                epsverdi={props.formue.eps ? (props.formue.eps.depositumsBeløp ?? 0) : null}
            />
        </div>
    );
};

export default OppsummeringAvFormue;
