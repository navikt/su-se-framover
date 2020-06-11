import * as React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Stegindikator from 'nav-frontend-stegindikator';
import { createIntl, createIntlCache, RawIntlProvider } from 'react-intl';

import styles from './index.module.less';
import Inngang from './steg/inngang/Inngang';
import { Søknadsteg } from './types';
import Uførevedtak from './steg/uførevedtak/Uførevedtak';
import FlyktningstatusOppholdstillatelse from './steg/flyktningstatus-oppholdstillatelse/Flyktningstatus-oppholdstillatelse';
import BoOgOppholdINorge from './steg/bo-og-opphold-i-norge/Bo-og-opphold-i-norge';
import Formue from './steg/formue/DinFormue';
import Inntekt from './steg/inntekt/Inntekt';
import Utenlandsopphold from './steg/utenlandsopphold/Utenlandsopphold';
import Kontakt from './steg/kontakt/Kontakt';
import Oppsummering from './steg/oppsummering/Oppsumering';

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
            'steg.oppsummering': 'Oppsummering',
            'steg.neste': 'Neste',
            'steg.forrige': 'Forrige'
        }
    },
    cache
);

const index = () => {
    const { step } = useParams<{ step: Søknadsteg }>();
    const history = useHistory();

    const steg = [
        {
            index: 0,
            label: intl.formatMessage({ id: 'steg.uforevedtak' }),
            step: Søknadsteg.Uførevedtak
        },
        {
            index: 1,
            label: intl.formatMessage({ id: 'steg.flyktningstatus' }),
            step: Søknadsteg.FlyktningstatusOppholdstillatelse
        },
        {
            index: 2,
            label: intl.formatMessage({ id: 'steg.boOgOppholdINorge' }),
            step: Søknadsteg.BoOgOppholdINorge
        },
        {
            index: 3,
            label: intl.formatMessage({ id: 'steg.formue' }),
            step: Søknadsteg.DinFormue
        },
        {
            index: 4,
            label: intl.formatMessage({ id: 'steg.inntekt' }),
            step: Søknadsteg.DinInntekt
        },
        {
            index: 5,
            label: intl.formatMessage({ id: 'steg.utenlandsopphold' }),
            step: Søknadsteg.ReiseTilUtlandet
        },
        {
            index: 6,
            label: intl.formatMessage({ id: 'steg.kontakt' }),
            step: Søknadsteg.Kontakt
        },
        {
            index: 7,
            label: intl.formatMessage({ id: 'steg.oppsummering' }),
            step: Søknadsteg.Oppsummering
        }
    ];

    return (
        <RawIntlProvider value={intl}>
            <div className={styles.container}>
                <div className={styles.headerContainer}>
                    <div>
                        <h1>Søknad</h1>
                    </div>
                    <Stegindikator
                        steg={steg.map(s => ({
                            index: s.index,
                            label: s.label,
                            aktiv: s.step === step
                        }))}
                        visLabel={false}
                        onChange={index => {
                            const nyttSteg = steg[index];
                            if (nyttSteg) {
                                history.push(`/soknad/${nyttSteg.step}`);
                            }
                        }}
                    />
                    <h2>
                        {steg.find((s => s.step === step))?.label}
                    </h2>
                </div>
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
