import { render } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ObfuscateLayout } from "./util/obfuscate";

import { Home } from "./pages/home";
import { Apps } from "./pages/apps";
//import { Games } from "./pages/games";
import { Settings } from "./pages/settings";
import { Privacy } from "./pages/privacy";
import { Error } from "./pages/error";
import { Nav } from "./components/nav";
import { Footer } from "./components/footer";

import "./util/locale";
import "./style/index.css";

function App() {

	/**
	 * <Route path="/games" element={<Games />} />
	 */

	return (
		<div className={"App"}>
			<BrowserRouter>
				<ObfuscateLayout />
				<main class="main p-7">
					<Nav />
					<Routes>
						<Route path="/" element={<Home />} />
						<Route path="/apps" element={<Apps />} />
						<Route path="/settings/search" element={<Settings />} />
						<Route path="/settings/tab" element={<Settings />} />
						<Route path="/settings/appearance" element={<Settings />} />
						<Route path="/settings/locale" element={<Settings />} />
						<Route path="/privacy" element={< Privacy />} />
						<Route path="*" element={<Error />} />
					</Routes>
				</main>
				<Footer />
			</BrowserRouter>
		</div>
	);
}

render(<App />, document.getElementById("app")!);
