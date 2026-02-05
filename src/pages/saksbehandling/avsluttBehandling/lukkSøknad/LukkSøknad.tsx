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
import {
    forTidligÅSøkeNyPeriode,
    lukkSøknadBegrunnelseI18nId,
} from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/lukkSøknadUtils.ts';
import { TrukketForm } from '~src/pages/saksbehandling/avsluttBehandling/lukkSøknad/TrukketForm.tsx';
import { AvsluttSøknadsbehandlingBegrunnelse, LukkSøknadBegrunnelse, Søknad } from '~src/types/Søknad.ts';

const LukkSøknadOgAvsluttBehandling = (props: { søknad: Søknad }) => {
    const { formatMessage } = useI18n({ messages: nb });
    const [valgtBegrunnelse, setValgtbegrunnelse] = useState<string>('velgBegrunnelse');
    const sak = useOutletContext<SaksoversiktContext>().sak;

    return (
        <div>
            <div className={styles.selectContainer}>
                <Select
                    label={formatMessage('lukkSøknadOgAvsluttSøknadsbehandling.begrunnelseForAvsluttelse')}
                    value={valgtBegrunnelse}
                    onChange={(e) => {
                        setValgtbegrunnelse(e.target.value);
                    }}
                >
                    <option value="velgBegrunnelse">{formatMessage('selector.velgBegrunnelse')}</option>
                    <option value={LukkSøknadBegrunnelse.Trukket} key={LukkSøknadBegrunnelse.Trukket}>
                        {formatMessage(lukkSøknadBegrunnelseI18nId[LukkSøknadBegrunnelse.Trukket])}
                    </option>
                    <option value={LukkSøknadBegrunnelse.Bortfalt} key={LukkSøknadBegrunnelse.Bortfalt}>
                        {formatMessage(lukkSøknadBegrunnelseI18nId[LukkSøknadBegrunnelse.Bortfalt])}
                    </option>
                    {forTidligÅSøkeNyPeriode(sak) && (
                        <option value={LukkSøknadBegrunnelse.Avslag} key={LukkSøknadBegrunnelse.Avslag}>
                            {formatMessage(lukkSøknadBegrunnelseI18nId[LukkSøknadBegrunnelse.Avslag])}
                        </option>
                    )}
                    <option
                        value={AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok}
                        key={AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok}
                    >
                        {formatMessage(lukkSøknadBegrunnelseI18nId[AvsluttSøknadsbehandlingBegrunnelse.ManglendeDok])}
                    </option>
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

export default LukkSøknadOgAvsluttBehandling;
