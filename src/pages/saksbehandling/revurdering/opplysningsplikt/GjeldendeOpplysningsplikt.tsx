import { Heading } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { useI18n } from '~src/lib/i18n';
import { VurderingsperiodeOpplysningsplikt } from '~src/types/grunnlagsdataOgVilkårsvurderinger/opplysningsplikt/Opplysningsplikt';

import styles from './gjeldendeOpplysningsplikt.module.less';
import messages from './opplysningsplikt-nb';

const GjeldendeOpplysningsplikt = (props: { opplysningsplikter?: VurderingsperiodeOpplysningsplikt[] }) => {
    const { formatMessage } = useI18n({ messages: { ...messages } });
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {formatMessage('eksisterende.vedtakinfo.tittel')}
            </Heading>

            <ul className={styles.grunnlagsliste}>
                {props.opplysningsplikter?.map((opplysningsplikt) => (
                    <li key={`${opplysningsplikt.periode.fraOgMed} - ${opplysningsplikt.periode.tilOgMed}`}>
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('datepicker.fom')}
                            verdi={opplysningsplikt.periode.fraOgMed}
                        />
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('datepicker.tom')}
                            verdi={opplysningsplikt.periode.tilOgMed}
                        />
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={formatMessage('select.label')}
                            verdi={formatMessage(opplysningsplikt.beskrivelse)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeOpplysningsplikt;
