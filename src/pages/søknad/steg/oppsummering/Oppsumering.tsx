import * as React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import Ekspanderbartpanel from 'nav-frontend-ekspanderbartpanel';
import { Element, Normaltekst } from 'nav-frontend-typografi'
import TextProvider, { Languages } from '~components/TextProvider';
import { Søknadsteg } from '../../types';
import Bunnknapper from '../../bunnknapper/Bunnknapper';

import styles from './oppsummering.module.less';
import sharedStyles from '../../steg-shared.module.less';

const OppsummeringsFelt = (props: { label: React.ReactNode, verdi: string | React.ReactNode }) => (<div className={styles.oppsummeringsfelt}>
    <Element>{props.label}</Element>
    <Normaltekst>{props.verdi}</Normaltekst>
</div>)

const Oppsummering = () => {
    const intl = useIntl()
    return (
        <TextProvider messages={{ [Languages.nb]: {} }}>
            <div className={sharedStyles.container}>

                <Ekspanderbartpanel className={styles.ekspanderbarOppsumeringSeksjon} tittel={intl.formatMessage({ id: "id" })}>
                    <OppsummeringsFelt label={<FormattedMessage id="label" />} verdi={"test"} />
                    <OppsummeringsFelt label={<FormattedMessage id="label" />} verdi={"test"} />
                </Ekspanderbartpanel>

                <Ekspanderbartpanel className={styles.ekspanderbarOppsumeringSeksjon} tittel={intl.formatMessage({ id: "id" })}>
                    <FormattedMessage id="test" />
                </Ekspanderbartpanel>

                <Bunnknapper
                    previous={{
                        onClick: () => {
                            console.log('previous');
                        },
                        steg: Søknadsteg.ReiseTilUtlandet
                    }}
                    next={{
                        onClick: () => {
                            console.log('next');
                        },
                        steg: Søknadsteg.Oppsummering
                    }}
                />
            </div>
        </TextProvider>
    );
};

export default Oppsummering;
