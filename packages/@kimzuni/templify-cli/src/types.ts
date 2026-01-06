import type * as tply from "@kimzuni/templify";

export type { Options } from "./cli";

export type SubCommand = keyof ReturnType<typeof tply.compile>;
