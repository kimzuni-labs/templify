import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { ThemeProvider } from "@/components/ui/theme-provider";

import { App } from "./App.tsx";

import "./styles/index.css";



// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<ThemeProvider>
			<App/>
		</ThemeProvider>
	</StrictMode>,
);
