import * as tply from "@kimzuni/templify";
import type { RunnerProps } from "@/App";
import { Controller } from "@/versions/v3/controller";



export default function HEAD(props: RunnerProps) {
	return (
		<Controller
			{...props}
			module={tply}
		/>
	);
}
