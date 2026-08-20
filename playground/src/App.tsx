import { lazy, Suspense, useTransition } from "react";

import { cn } from "@/lib/utils";
import { useVersion } from "@/hooks/use-version";

import { Loading } from "@/components/loading";
import { Header } from "@/components/header";
import { VersionSelect } from "@/components/version-select";

import * as config from "@/versions/config";



const versions = config.VERSIONS;
const RunnerMap = Object.fromEntries(
	versions.map(v => [
		v.value,
		lazy(() => import(`./versions/${v.dirname ?? v.value}/runner.tsx`)),
	]),
);



export function App() {
	const [version, setVersion] = useVersion();
	const [isPending, startTransition] = useTransition();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const Runner = RunnerMap[version.value]!;

	const handleVersionChange = (version: config.VersionInfo) => {
		startTransition(() => {
			setVersion(version);
		});
	};

	return (
		<>
			<Header heading="Templify Playground" className="border-b">
				<VersionSelect
					value={version}
					items={versions}
					onValueChange={handleVersionChange}
				/>
			</Header>
			<div className={cn(
				"transition-opacity",
				isPending && "opacity-50 pointer-events-none",
			)}>
				<Suspense fallback={<Loading/>}>
					<Runner/>
				</Suspense>
			</div>
		</>
	);
}
