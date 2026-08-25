import { useState, useEffect, useCallback } from "react";

import { type VersionInfo, DEFAULT_VERSION, getVersionItem } from "@/versions/config";



export function useVersion() {
	const getInitialVersion = useCallback(() => {
		const params = new URLSearchParams(window.location.search);
		const item = getVersionItem(params.get("version"));
		return item?.value === DEFAULT_VERSION.value ? undefined : item;
	}, []);

	const [version, setVersionState] = useState(getInitialVersion);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		const currVersion = params.get("version");
		const currItem = getVersionItem(currVersion) ?? DEFAULT_VERSION;
		const isDefault = currItem.value === DEFAULT_VERSION.value;

		const url = new URL(window.location.href);
		if (isDefault) {
			url.searchParams.delete("version");
		} else {
			url.searchParams.set("version", currItem.value);
		}

		const href = url.toString();
		if (href !== window.location.href) {
			window.history.replaceState(null, "", href);
		}
	}, []);

	const setVersion = (nextVersion: VersionInfo) => {
		const url = new URL(window.location.href);
		if (nextVersion.value === DEFAULT_VERSION.value) {
			setVersionState(undefined);
			url.searchParams.delete("version");
		} else {
			setVersionState(nextVersion);
			url.searchParams.set("version", nextVersion.value);
		}

		window.history.replaceState(null, "", url.toString());
	};

	return [
		version ?? DEFAULT_VERSION,
		setVersion,
	] as const;
}
