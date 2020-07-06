import * as React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import Stegindikator from 'nav-frontend-stegindikator';

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
import { Innholdstittel, Undertittel } from 'nav-frontend-typografi';
import { useI18n } from '../../lib/hooks';

const messages = {
    'steg.uforevedtak': 'Uførevedtak',
    'steg.flyktningstatus': 'Flyktningstatus',
    'steg.boOgOppholdINorge': 'Bo og opphold i Norge',
    'steg.formue': 'Din formue',
    'steg.inntekt': 'Din inntekt',
    'steg.utenlandsopphold': 'Reise til utlandet',
    'steg.kontakt': 'Kontakt',
    'steg.oppsummering': 'Oppsummering',
    'steg.neste': 'Neste',
    'steg.forrige': 'Forrige',
};

const index = () => {
    const { step } = useParams<{ step: Søknadsteg }>();
    const history = useHistory();

    const intl = useI18n({ messages });

    const steg = [
        {
            index: 0,
            label: intl.formatMessage({ id: 'steg.uforevedtak' }),
            step: Søknadsteg.Uførevedtak,
        },
        {
            index: 1,
            label: intl.formatMessage({ id: 'steg.flyktningstatus' }),
            step: Søknadsteg.FlyktningstatusOppholdstillatelse,
        },
        {
            index: 2,
            label: intl.formatMessage({ id: 'steg.boOgOppholdINorge' }),
            step: Søknadsteg.BoOgOppholdINorge,
        },
        {
            index: 3,
            label: intl.formatMessage({ id: 'steg.formue' }),
            step: Søknadsteg.DinFormue,
        },
        {
            index: 4,
            label: intl.formatMessage({ id: 'steg.inntekt' }),
            step: Søknadsteg.DinInntekt,
        },
        {
            index: 5,
            label: intl.formatMessage({ id: 'steg.utenlandsopphold' }),
            step: Søknadsteg.ReiseTilUtlandet,
        },
        {
            index: 6,
            label: intl.formatMessage({ id: 'steg.kontakt' }),
            step: Søknadsteg.Kontakt,
        },
        {
            index: 7,
            label: intl.formatMessage({ id: 'steg.oppsummering' }),
            step: Søknadsteg.Oppsummering,
        },
    ];
    const aktivtSteg = steg.map((s) => s.step).indexOf(step);

    return (
        <div className={styles.container}>
            <div className={styles.headerContainer}>
                <div className={styles.sidetittelContainer}>
                    <Innholdstittel>Søknad</Innholdstittel>
                </div>
                {step !== Søknadsteg.Inngang && (
                    <>
                        <div className={styles.stegindikatorContainer}>
                            <Stegindikator
                                steg={steg.map((s) => ({
                                    index: s.index,
                                    label: s.label,
                                }))}
                                aktivtSteg={aktivtSteg}
                                visLabel={false}
                                onChange={(index) => {
                                    const nyttSteg = steg[index];
                                    if (nyttSteg) {
                                        history.push(`/soknad/${nyttSteg.step}`);
                                    }
                                }}
                            />
                        </div>
                        <Undertittel>{steg.find((s) => s.step === step)?.label}</Undertittel>
                    </>
                )}
            </div>
            {step === Søknadsteg.Inngang ? (
                <Inngang nesteUrl={`/soknad/${Søknadsteg.Uførevedtak}`} />
            ) : step === Søknadsteg.Uførevedtak ? (
                <Uførevedtak
                    forrigeUrl={`/soknad/${Søknadsteg.Inngang}`}
                    nesteUrl={`/soknad/${Søknadsteg.FlyktningstatusOppholdstillatelse}`}
                />
            ) : step === Søknadsteg.FlyktningstatusOppholdstillatelse ? (
                <FlyktningstatusOppholdstillatelse
                    forrigeUrl={`/soknad/${Søknadsteg.Uførevedtak}`}
                    nesteUrl={`/soknad/${Søknadsteg.BoOgOppholdINorge}`}
                />
            ) : step === Søknadsteg.BoOgOppholdINorge ? (
                <BoOgOppholdINorge
                    forrigeUrl={`/soknad/${Søknadsteg.FlyktningstatusOppholdstillatelse}`}
                    nesteUrl={`/soknad/${Søknadsteg.DinFormue}`}
                />
            ) : step === Søknadsteg.DinFormue ? (
                <Formue
                    forrigeUrl={`/soknad/${Søknadsteg.BoOgOppholdINorge}`}
                    nesteUrl={`/soknad/${Søknadsteg.DinInntekt}`}
                />
            ) : step === Søknadsteg.DinInntekt ? (
                <Inntekt
                    forrigeUrl={`/soknad/${Søknadsteg.DinFormue}`}
                    nesteUrl={`/soknad/${Søknadsteg.ReiseTilUtlandet}`}
                />
            ) : step === Søknadsteg.ReiseTilUtlandet ? (
                <Utenlandsopphold
                    forrigeUrl={`/soknad/${Søknadsteg.DinInntekt}`}
                    nesteUrl={`/soknad/${Søknadsteg.Kontakt}`}
                />
            ) : step === Søknadsteg.Kontakt ? (
                <Kontakt
                    forrigeUrl={`/soknad/${Søknadsteg.ReiseTilUtlandet}`}
                    nesteUrl={`/soknad/${Søknadsteg.Oppsummering}`}
                />
            ) : step === Søknadsteg.Oppsummering ? (
                <Oppsummering forrigeUrl={`/soknad/${Søknadsteg.Kontakt}`} />
            ) : (
                '404'
            )}
        </div>
    );
};

export default index;
