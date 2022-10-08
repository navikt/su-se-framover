import { Heading } from '@navikt/ds-react';
import React from 'react';
import { useOutletContext } from 'react-router-dom';

import { useI18n } from '~src/lib/i18n';
import { UtenlandsoppholdDokumentasjon } from '~src/types/RegistrertUtenlandsopphold';
import { SaksoversiktContext } from '~src/utils/router/routerUtils';

import OppsummeringAvRegistrerteUtenlandsopphold from './OppsummeringAvRegistrerteUtenlandsopphold';
import RegistreringAvUtenlandsopphold from './RegistreringAvUtenlandsopphold';
import messages from './RegistreringAvUtenlandsopphold-nb';
import styles from './RegistreringAvUtenlandsopphold.module.less';

const topkek = [
    {
        id: '12',
        periode: { fraOgMed: '2022.01.01', tilOgMed: '2022.12.31' },
        dokumentasjon: UtenlandsoppholdDokumentasjon.Dokumentert,
        journalposter: [],
        opprettetAv: 'Saks behandler',
        opprettetTidspunkt: '01.01.2022 20:01',
        endretAv: 'Behandker. Sak',
        endretTidspunkt: '01.01.2022 20:01',
        versjon: 1,
        antallDager: 1,
    },
    {
        id: '34',
        periode: { fraOgMed: '2023.01.01', tilOgMed: '2023.12.31' },
        dokumentasjon: UtenlandsoppholdDokumentasjon.Sannsynliggjort,
        journalposter: ['123'],
        opprettetAv: 'Saks behandler',
        opprettetTidspunkt: '01.01.2022 20:01',
        endretAv: 'Behandker. Sak',
        endretTidspunkt: '01.01.2022 20:01',
        versjon: 1,
        antallDager: 1,
    },
    {
        id: '45',
        periode: { fraOgMed: '2024.01.01', tilOgMed: '2024.12.31' },
        dokumentasjon: UtenlandsoppholdDokumentasjon.Udokumentert,
        journalposter: ['123', '456', '789'],
        opprettetAv: 'Saks behandler',
        opprettetTidspunkt: '01.01.2022 20:01',
        endretAv: 'Behandker. Sak',
        endretTidspunkt: '01.01.2022 20:01',
        versjon: 1,
        antallDager: 1,
    },
];

const Utenlandsopphold = () => {
    const { sak } = useOutletContext<SaksoversiktContext>();
    const { formatMessage } = useI18n({ messages });
    return (
        <div className={styles.pageContainer}>
            <div className={styles.headingContainer}>
                <Heading className={styles.utenlandsoppholdHeading} size="large">
                    {formatMessage('page.heading')}
                </Heading>
            </div>
            <div className={styles.mainContentContainer}>
                <RegistreringAvUtenlandsopphold sakId={sak.id} />
                <OppsummeringAvRegistrerteUtenlandsopphold sakId={sak.id} registrerteUtenlandsopphold={topkek} />
            </div>
        </div>
    );
};

export default Utenlandsopphold;
