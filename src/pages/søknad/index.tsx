import * as React from 'react';
import { useParams } from 'react-router-dom';
import Stegindikator from 'nav-frontend-stegindikator';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';

import styles from './index.module.less';
import Inngang from './inngang';
import { Søknadsteg } from './types';
import Uførevedtak from './uførevedtak';
import FlyktningstatusOppholdstillatelse from './flyktningstatus-oppholdstillatelse';
import BoOgOppholdINorge from './bo-og-opphold-i-norge';

const cache = createIntlCache();
const intl = createIntl(
    {
        locale: 'nb-NO',
        messages: { steg1: 'Steg 1', steg2: 'Steg 2' }
    },
    cache
);

const index = () => {
    const { step } = useParams<{ step: Søknadsteg }>();
    return (
        <RawIntlProvider value={intl}>
            <div className={styles.container}>
                <div>
                    <h1>tempt-tittel</h1>
                </div>
                <Stegindikator
                    steg={[
                        { index: 1, label: intl.formatMessage({ id: 'steg1' }), aktiv: step === Søknadsteg.Inngang },
                        {
                            index: 2,
                            label: intl.formatMessage({ id: 'steg2' }),
                            aktiv: step === Søknadsteg.FlyktningstatusOppholdstillatelse
                        }
                    ]}
                    visLabel={true}
                />
                {step === Søknadsteg.Inngang ? (
                    <Inngang />
                ) : step === Søknadsteg.Uførevedtak ? (
                    <Uførevedtak />
                ) : step === Søknadsteg.FlyktningstatusOppholdstillatelse ? (
                    <FlyktningstatusOppholdstillatelse />
                ) : step === Søknadsteg.BoOgOppholdINorge ? (
                    <BoOgOppholdINorge />
                ) : (
                    '404'
                )}
            </div>
        </RawIntlProvider>
    );
};

export default index;
