import type { CompileOptions } from "@kimzuni/templify";
import type { PrimitiveDataType, DataItem, LabeledValue } from "@/types/playground";



export type KeyPreset = "shallow" | "deep" | "custom";

export interface PresetOptions extends Omit<Required<CompileOptions>, "spacing"> {
	keyPreset    : KeyPreset;
	key          : string;
	enableSpacing: boolean;
	spacingStrict: boolean;
	spacingSize  : [number, number];
	fallbackType : PrimitiveDataType;
	fallback     : string;
}

export interface Preset extends LabeledValue {
	template: string;
	options : PresetOptions;
	data    : DataItem[];
}

export const KEY_PRESETS: LabeledValue[] = [
	{
		label: "Shallow",
		value: "shallow",
	},
	{
		label: "Deep",
		value: "deep",
	},
	{
		label: "Custom",
		value: "custom",
	},
];

export const PRESETS: Preset[] = [
	{
		label   : "Greeting (Default)",
		value   : "greeting",
		template: "Hello, {name}!\nToday is {day}. Have a great day!",
		options : {
			keyPreset    : "deep",
			key          : "",
			open         : "{",
			close        : "}",
			enableSpacing: false,
			spacingStrict: false,
			spacingSize  : [0, -1],
			fallbackType : "undefined",
			fallback     : "",
			depth        : -1,
		},
		data: [
			{ id: "name", key: "name", type: "string", value: "John Doe" },
			{ id: "day", key: "day", type: "string", value: "Thursday" },
		],
	},
	{
		label   : "SQL Query (Strict Spacing Check)",
		value   : "sql",
		template: "SELECT { fields } FROM { table } WHERE id = {id} AND status = { status };",
		options : {
			keyPreset    : "shallow",
			key          : "",
			open         : "{",
			close        : "}",
			enableSpacing: true,
			spacingStrict: true,
			spacingSize  : [0, -1],
			fallbackType : "null",
			fallback     : "",
			depth        : -1,
		},
		data: [
			{ id: "1", key: "fields", type: "string", value: "id, name, email" },
			{ id: "2", key: "table", type: "string", value: "users" },
			{ id: "3", key: "id", type: "number", value: "42" },
			{ id: "4", key: "status", type: "string", value: "active" },
		],
	},
	{
		label   : "Nested Object",
		value   : "nested",
		template: "User Info:\n- Name: {user.profile.name}\n- Email: {user.profile.email}\n- Is Admin: {user.isAdmin}\n- Interests: {user.interests[0]}, {user.interests[1]}",
		options  : {
			keyPreset    : "deep",
			key          : "",
			open         : "{",
			close        : "}",
			enableSpacing: false,
			spacingStrict: false,
			spacingSize  : [0, -1],
			fallbackType : "undefined",
			fallback     : "",
			depth        : -1,
		},
		data: [
			{
				id      : "user",
				key     : "user",
				type    : "object",
				children: [
					{
						id      : "profile",
						key     : "profile",
						type    : "object",
						children: [
							{ id: "name", key: "name", type: "string", value: "Jane Doe" },
							{ id: "email", key: "email", type: "string", value: "jane@example.com" },
						],
					},
					{ id: "isAdmin", key: "isAdmin", type: "boolean", value: "true" },
					{
						id      : "interests",
						key     : "interests",
						type    : "array",
						children: [
							{ id: "int1", key: "0", type: "string", value: "Reading" },
							{ id: "int2", key: "1", type: "string", value: "Watching Movies" },
						],
					},
				],
			},
		],
	},
	{
		label   : "Custom",
		value   : "custom",
		template: "Feel free to type and test the {placeholder}.",
		options : {
			keyPreset    : "deep",
			key          : "",
			open         : "{",
			close        : "}",
			enableSpacing: false,
			spacingStrict: false,
			spacingSize  : [0, -1],
			fallbackType : "undefined",
			fallback     : "",
			depth        : -1,
		},
		data: [
			{ id: "1", key: "placeholder", value: "template", type: "string" },
		],
	},
];



// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const DEFAULT_PRESET = PRESETS[0]!;
