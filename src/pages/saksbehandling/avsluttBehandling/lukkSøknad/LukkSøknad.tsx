import { ChevronLeftIcon } from '@navikt/aksel-icons';
import { Select } from '@navikt/ds-react';
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import LinkAsButton from '~src/components/linkAsButton/LinkAsButton.tsx';
import { SaksoversiktContext } from '~src/context/SaksoversiktContext.ts';
import { useI18n } from '~src/lib/i18n.ts';
import * as Routes from '~src/lib/routes';
import { AvslagDokumentasjonForm } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/AvslagDokumentasjonForm.tsx';
import { AvslagForm } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/AvslagForm.tsx';
import { BortfaltForm } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/BortfaltForm.tsx';
import styles from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad.module.less';
import nb from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknad-nb.ts';
import { TrukketForm } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/TrukketForm.tsx';
import {
    AvsluttSøknadsbehandlingBegrunnelse,
    LukkSøknadBegrunnelse,
    LukkSøknadOgAvsluttSøknadsbehandlingType,
    Søknad,
} from '~src/types/Søknad.ts';
import { sorterUtbetalingsperioder } from '~src/types/Utbetalingsperiode.ts';
import { startenPåMnd } from '~src/utils/date/dateUtils.ts';

const LukkSøknadOgAvsluttBehandling = (props: { søknad: Søknad }) => {
    const { formatMessage } = useI18n({ messages: nb });

    const [valgtBegrunnelse, setValgtbegrunnelse] = useState<string>('velgBegrunnelse');

    const sak = useOutletContext<SaksoversiktContext>().sak;

    function sjekkOmkanSøke(): boolean {
        if (sak.utbetalinger.length === 0) {
            return true;
        }
        const sortertUtbetalingsperioder = sorterUtbetalingsperioder(sak.utbetalinger);
        const sisteUtbetalingsDato = new Date(
            sortertUtbetalingsperioder[sortertUtbetalingsperioder.length - 1].tilOgMed,
        );
        const toMndFørTilogMed = startenPåMnd(sisteUtbetalingsDato);
        toMndFørTilogMed.setMonth(toMndFørTilogMed.getMonth() - 1);
        return new Date() >= toMndFørTilogMed;
    }

    const fjernForTidligSøknad = (begrunnelse: LukkSøknadBegrunnelse) =>
        !(begrunnelse === LukkSøknadBegrunnelse.Avslag && sjekkOmkanSøke());

    return (
        <div>
            <div className={styles.selectContainer}>
                <Select
                    label={formatMessage('lukkSøknadOgAvsluttSøknadsbehandling.begrunnelseForAvsluttelse')}
                    value={valgtBegrunnelse}
                    onChange={(e) => {
                        console.log(e.target.value);
                        setValgtbegrunnelse(e.target.value);
                    }}
                >
                    <option value="velgBegrunnelse">{formatMessage('selector.velgBegrunnelse')}</option>
                    {Object.values(LukkSøknadBegrunnelse)
                        .filter(fjernForTidligSøknad)
                        .map((begrunnelse) => (
                            <option value={begrunnelse} key={begrunnelse}>
                                {formatMessage(lukkSøknadBegrunnelseI18nId[begrunnelse])}
                            </option>
                        ))}
                    {Object.values(AvsluttSøknadsbehandlingBegrunnelse).map((begrunnelse) => (
                        <option value={begrunnelse} key={begrunnelse}>
                            {formatMessage(lukkSøknadBegrunnelseI18nId[begrunnelse])}
                        </option>
                    ))}
                </Select>
            </div>
            {valgtBegrunnelse === LukkSøknadBegrunnelse.Trukket && <TrukketForm søknad={props.søknad} sakId={sak.id} />}
            {valgtBegrunnelse === LukkSøknadBegrunnelse.Bortfalt && (
                <BortfaltForm søknad={props.søknad} sakId={sak.id} />
            )}
            {valgtBegrunnelse === LukkSøknadBegrunnelse.Avslag && <AvslagForm søknad={props.søknad} sakId={sak.id} />}
            {valgtBegrunnelse === AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok && (
                <AvslagDokumentasjonForm søknad={props.søknad} sakId={sak.id} />
            )}
            {valgtBegrunnelse === 'velgBegrunnelse' && (
                <LinkAsButton href={Routes.saksoversiktValgtSak.createURL({ sakId: sak.id })} variant="secondary">
                    <ChevronLeftIcon />
                    {formatMessage('link.tilbake')}
                </LinkAsButton>
            )}
        </div>
    );
};

const lukkSøknadBegrunnelseI18nId: { [key in LukkSøknadOgAvsluttSøknadsbehandlingType]: keyof typeof nb } = {
    TRUKKET: 'lukking.begrunnelse.trukket',
    BORTFALT: 'lukking.begrunnelse.bortfalt',
    AVSLAG: 'lukking.begrunnelse.avslag',
    MANGLENDE_DOK: 'avslutt.manglendeDokumentasjon',
};

export default LukkSøknadOgAvsluttBehandling;
