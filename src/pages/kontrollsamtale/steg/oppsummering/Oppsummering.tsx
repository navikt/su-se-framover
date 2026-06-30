import { useNavigate } from 'react-router-dom';
import KontrollsamtaleOppsummering from 'src/pages/kontrollsamtale/steg/oppsummering/components/Kontrollsamtaleoppsummering/KontrollsamtaleOppsummering.tsx';
import Bunnknapper from '~src/pages/søknad/bunnknapper/Bunnknapper.tsx';
import sharedStyles from '~src/pages/søknad/steg-shared.module.less';

type Props = {
    forrigeUrl: string;
    nesteUrl: string;
    avbrytUrl: string;
};

const Oppsummering = ({ forrigeUrl, avbrytUrl }: Props) => {
    const navigate = useNavigate();

    return (
        <div className={sharedStyles.container}>
            <KontrollsamtaleOppsummering />
            <div style={{ marginTop: '2rem' }}>
                <Bunnknapper
                    previous={{
                        onClick: () => {
                            navigate(forrigeUrl);
                        },
                    }}
                    next={{}}
                    avbryt={{
                        toRoute: avbrytUrl,
                    }}
                />
            </div>
        </div>
    );
};
export default Oppsummering;
