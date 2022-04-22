import { Heading, Label } from '@navikt/ds-react';
import React from 'react';

import { OppsummeringPar } from '~src/components/revurdering/oppsummering/oppsummeringspar/Oppsummeringsverdi';
import { MessageFormatter } from '~src/lib/i18n';
import { Bosituasjon } from '~src/types/grunnlagsdataOgVilkårsvurderinger/bosituasjon/Bosituasjongrunnlag';
import * as DateUtils from '~src/utils/date/dateUtils';

import messages from './bosituasjonForm-nb';
import styles from './bosituasjonForm.module.less';

const GjeldendeBosituasjon = (props: {
    bosituasjon?: Bosituasjon[];
    formatMessage: MessageFormatter<typeof messages>;
}) => {
    return (
        <div>
            <Heading level="2" size="large" spacing>
                {props.formatMessage('eksisterende.vedtakinfo.tittel')}
            </Heading>
            <ul className={styles.grunnlagsliste}>
                {props.bosituasjon?.map((item, index) => (
                    <li key={index}>
                        <Label spacing>{DateUtils.formatPeriode(item.periode)}</Label>
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={props.formatMessage('eksisterende.vedtakinfo.søkerBorMed')}
                            verdi={props.formatMessage(
                                item.fnr
                                    ? 'eksisterende.vedtakinfo.eps'
                                    : item.delerBolig
                                    ? 'eksisterende.vedtakinfo.over18år'
                                    : 'eksisterende.vedtakinfo.enslig'
                            )}
                        />

                        {item.fnr && (
                            <div>
                                <OppsummeringPar
                                    className={styles.informasjonsbitContainer}
                                    label={props.formatMessage('eksisterende.vedtakinfo.eps')}
                                    verdi={item.fnr}
                                />
                                <OppsummeringPar
                                    className={styles.informasjonsbitContainer}
                                    label={props.formatMessage('eksisterende.vedtakinfo.eps')}
                                    verdi={props.formatMessage(
                                        item.ektemakeEllerSamboerUførFlyktning
                                            ? 'eksisterende.vedtakinfo.ja'
                                            : 'eksisterende.vedtakinfo.nei'
                                    )}
                                />
                            </div>
                        )}
                        <OppsummeringPar
                            className={styles.informasjonsbitContainer}
                            label={props.formatMessage('eksisterende.vedtakinfo.sats')}
                            verdi={item.sats}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default GjeldendeBosituasjon;
