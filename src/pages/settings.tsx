import { Head } from "../components/head";
import { UtilLink } from "../util/link";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchIcon } from "../assets/searchIcon";
import { TabIcon } from "../assets/tabIcon";
import { AppearanceIcon } from "../assets/appearanceIcon";
import { LocaleIcon } from "../assets/localeIcon";
import { Obfuscated } from "../util/obfuscate";
//import { AppearanceSettings } from "./settings/appearance";
import { SearchSettings } from "./settings/search";
import { TabSettings } from "./settings/tab";
import { LocaleSettings } from "./settings/locale";

function Settings() {
    const { t } = useTranslation();
    const pathname = useLocation().pathname;
    
    const sections = () => {
        switch(pathname) {
            case "/settings/search":
                return <SearchSettings />
            case "/settings/tab":
                    return <TabSettings />
            //case "/settings/appearance":
                //return <AppearanceSettings /> # バグがある可能性ありなので無効化
            case "/settings/locale":
                return <LocaleSettings />
        }
    }

    return (
        <>
            <Head pageTitle={t("title.settings")} />
            <div class="flex gap-7">
                <aside class="flex flex-col gap-4 sticky top-[108px] self-start">
                    <UtilLink activeClassName="bg-secondary text-textInverse settingsButtonActive" class="settingsButton rounded-lg px-4 py-2 select-none cursor-pointer h-10 flex items-center gap-1.5 w-auto sm:w-72" to="/settings/search">
                        <SearchIcon />
                        <span class="font-bold sr-only sm:not-sr-only"><Obfuscated>{t("settings.tabs.search")}</Obfuscated></span>
                    </UtilLink>
                    <UtilLink activeClassName="bg-secondary text-textInverse settingsButtonActive" class="settingsButton rounded-lg px-4 py-2 select-none cursor-pointer h-10 flex items-center gap-1.5 w-auto sm:w-72" to="/settings/tab">
                        <TabIcon />
                        <span class="font-bold #555 sr-only sm:not-sr-only"><Obfuscated>{t("settings.tabs.tab")}</Obfuscated></span>
                    </UtilLink>
                    <UtilLink activeClassName="bg-secondary text-textInverse settingsButtonActive" class="settingsButton rounded-lg px-4 py-2 select-none cursor-pointer h-10 flex items-center gap-1.5 w-auto sm:w-72" to="/settings/appearance">
                        <AppearanceIcon />
                        <span class="font-bold #555 sr-only sm:not-sr-only"><Obfuscated>{t("settings.tabs.appearance")}</Obfuscated></span>
                    </UtilLink>
                    <UtilLink activeClassName="bg-secondary text-textInverse settingsButtonActive" class="settingsButton rounded-lg px-4 py-2 select-none cursor-pointer h-10 flex items-center gap-1.5 w-auto sm:w-72" to="/settings/locale">
                        <LocaleIcon />
                        <span class="font-bold #555 sr-only sm:not-sr-only"><Obfuscated>{t("settings.tabs.locale")}</Obfuscated></span>
                    </UtilLink>
                </aside>
                <section>
                    {sections()}
                </section>
            </div>
        </>
    )
}

export { Settings };