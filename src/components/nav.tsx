import { UtilLink } from '../util/link';
import { useTranslation } from "react-i18next";
import { Button } from "../interface/button";
import { Logo } from '../assets/logo';
import { HomeIcon } from "../assets/homeIcon";
import { AppsIcon } from "../assets/appsIcon";
//import { GamesIcon } from "../assets/gamesIcon";
import { SettingsIcon } from "../assets/settingsIcon";
//import { Obfuscated } from '../util/obfuscate';

function Nav() {
    const { t } = useTranslation();

    /**
     * <UtilLink to="/games">
                    <Button active={true}>
                        <GamesIcon />
                        <span class="font-bold sr-only sm:not-sr-only"><Obfuscated>{t("nav.games")}</Obfuscated></span>
                    </Button>
                </UtilLink>
     */

    return (
        <nav class="nav px-7 py-5 flex items-center justify-between sticky top-0 right-0 left-0 bg-background">
            <UtilLink className="logo" to="/">
                <Logo class="h-10 w-10" />
            </UtilLink>
            <div class="flex gap-4">
                <UtilLink to="/" class="sr-only sm:not-sr-only">
                    <Button active={true}>
                        <HomeIcon />
                        <span class="font-bold sr-only sm:not-sr-only">{t("nav.home")}</span>
                    </Button>
                </UtilLink>
                <UtilLink to="/apps">
                    <Button active={true}>
                        <AppsIcon />
                        <span class="font-bold sr-only sm:not-sr-only">{t("nav.apps")}</span>
                    </Button>
                </UtilLink>
                <UtilLink to="/settings/search">
                    <Button active={true}>
                        <SettingsIcon />
                        <span class="font-bold sr-only sm:not-sr-only">{t("nav.settings")}</span>
                    </Button>
                </UtilLink>
            </div>
        </nav>
    )
}

export { Nav };