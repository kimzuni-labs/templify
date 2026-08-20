import { use } from "react";

import type * as tply from "@kimzuni/templify";
import type { RunnerProps } from "@/App";
import { loadEsmModule } from "@/lib/esm-loader";

import { ErrorBox } from "@/components/error-box";

import { Controller } from "./controller";



export default function V3(props: RunnerProps) {
	const { module, error } = use(loadEsmModule<typeof tply>(3));

	if (error) {
		console.error(error);
		return (
			<ErrorBox
				className="my-6"
				label="Failed to load ESM package"
				message={error.message}
			/>
		);
	}

	return (
		<Controller
			{...props}
			module={module}
		/>
	);
}
