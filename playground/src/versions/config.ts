import pkg from "@kimzuni/templify/package.json";



export const GIT_REF = import.meta.env.VITE_NEXT_GIT_REF;

export const LATEST_VERSION = pkg.version;
export const LATEST_MAJOR_VERSION = parseInt(pkg.version);



export interface VersionInfo {
	default?: boolean;
	dirname?: string;
	value   : string;
	label   : string;
}

export const VERSIONS: VersionInfo[] = [
	{
		value: "head",
		label: `HEAD (${GIT_REF ?? "dev"})`,
	},
	{
		default: true,
		dirname: `v${LATEST_MAJOR_VERSION}`,
		value  : `v${LATEST_VERSION}`,
		label  : `v${LATEST_VERSION} (Latest)`,
	},
];



// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const DEFAULT_VERSION = VERSIONS.find(x => x.default) ?? VERSIONS[0]!;

export const getVersionItem = (version: string | null | undefined) => {
	if (!version) return DEFAULT_VERSION;

	// try to find by value
	const item = VERSIONS.find(x => x.value === version);
	if (item) return item;

	// try to find by major version (dirname)
	const dirname = version.split(".")[0];
	if (!dirname) return DEFAULT_VERSION;

	return VERSIONS.find(x => x.dirname === dirname);
};
