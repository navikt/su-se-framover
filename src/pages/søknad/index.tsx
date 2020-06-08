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
import Formue from './formue';
import Inntekt from './inntekt';
import Utenlandsopphold from './utenlandsopphold';
import Kontakt from './kontakt';
import Oppsummering from './oppsummering';

const cache = createIntlCache();
const intl = createIntl(
    {
        locale: 'nb-NO',
        messages: {
            'steg.uforevedtak': 'Uførevedtak',
            'steg.flyktningstatus': 'Flyktningstatus',
            'steg.boOgOppholdINorge': 'Bo og opphold i Norge',
            'steg.formue': 'Din formue',
            'steg.inntekt': 'Din inntekt',
            'steg.utenlandsopphold': 'Reise til utlandet',
            'steg.kontakt': 'Kontakt',
            'steg.oppsummering': 'Oppsummering'
        }
    },
    cache
);

const index = () => {
    const { step } = useParams<{ step: Søknadsteg }>();
    return (
        <RawIntlProvider value={intl}>
            <div className={styles.container}>
                <div>
                    <h1>Søknad</h1>
                </div>
                <Stegindikator
                    steg={[
                        {
                            index: 1,
                            label: intl.formatMessage({ id: 'steg.uforevedtak' }),
                            aktiv: step === Søknadsteg.Uførevedtak
                        },
                        {
                            index: 2,
                            label: intl.formatMessage({ id: 'steg.flyktningstatus' }),
                            aktiv: step === Søknadsteg.FlyktningstatusOppholdstillatelse
                        },
                        {
                            index: 3,
                            label: intl.formatMessage({ id: 'steg.boOgOppholdINorge' }),
                            aktiv: step === Søknadsteg.BoOgOppholdINorge
                        },
                        {
                            index: 4,
                            label: intl.formatMessage({ id: 'steg.formue' }),
                            aktiv: step === Søknadsteg.DinFormue
                        },
                        {
                            index: 5,
                            label: intl.formatMessage({ id: 'steg.inntekt' }),
                            aktiv: step === Søknadsteg.DinInntekt
                        },
                        {
                            index: 6,
                            label: intl.formatMessage({ id: 'steg.utenlandsopphold' }),
                            aktiv: step === Søknadsteg.ReiseTilUtlandet
                        },
                        {
                            index: 7,
                            label: intl.formatMessage({ id: 'steg.kontakt' }),
                            aktiv: step === Søknadsteg.Kontakt
                        },
                        {
                            index: 8,
                            label: intl.formatMessage({ id: 'steg.oppsummering' }),
                            aktiv: step === Søknadsteg.Oppsummering
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
                ) : step === Søknadsteg.DinFormue ? (
                    <Formue />
                ) : step === Søknadsteg.DinInntekt ? (
                    <Inntekt />
                ) : step === Søknadsteg.ReiseTilUtlandet ? (
                    <Utenlandsopphold />
                ) : step === Søknadsteg.Kontakt ? (
                    <Kontakt />
                ) : step === Søknadsteg.Oppsummering ? (
                    <Oppsummering />
                ) : (
                    '404'
                )}
            </div>
        </RawIntlProvider>
    );
};

export default index;
