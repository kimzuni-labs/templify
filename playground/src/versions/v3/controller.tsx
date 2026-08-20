import { useState, useEffect } from "react";

import type * as tply from "@kimzuni/templify";
import type { RunnerProps } from "@/App";
import type { DataType, PrimitiveDataType, DataItem } from "@/types/playground";
import { cn } from "@/lib/utils";
import { storage, getInitialVal, getSavedOptions } from "@/lib/storage";
import { generateUUID } from "@/lib/random";
import { useMediaQuery } from "@/hooks/use-media-query";
import {
	resolveDataValue,
	updateItemInTree,
	removeItemFromTree,
	addChildToItemInTree,
	buildContext,
	sanitizeDataItems,
} from "@/lib/tree-utils";

import { toast } from "@/components/ui/toast";
import {
	Tabs,
	TabsList,
	TabsTrigger,
	TabsContent as BaseTabsContent,
} from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/select";
import {
	FieldSet,
	FieldLegend,
	OptionInput,
	OptionSelect,
	OptionCheckbox,
	AddButton,
	TabsContent,
} from "@/components/playground/fields";
import { ValueSelect, ValueInput } from "@/components/playground/value-editor";
import { DataItemRow } from "@/components/playground/data-item-row";
import { PlaygroundLayout } from "@/components/playground/layout";
import { TextArea } from "@/components/textarea";
import { Section } from "@/components/section";

import { PRESETS, DEFAULT_PRESET, KEY_PRESETS } from "./presets";



const TABS = [
	"code",
	"keys",
	"placeholders",
	"groups",
];

const getKeyPreset = (value: string) => KEY_PRESETS.find(x => x.value === value);



export interface ControllerProps extends RunnerProps {
	module: Pick<typeof tply, "compile" | "KEY_PATTERNS">;
}

export function Controller({
	isVersionChangeRef,
	module: {
		compile,
		KEY_PATTERNS,
	},
}: ControllerProps) {
	const isMobile = useMediaQuery("(width < 768px)");
	const [tabValue, setTabValue] = useState(TABS[0]);

	// 1. Restore preset from localStorage
	const initialPresetVal = storage.get("selected-preset") ?? DEFAULT_PRESET.value;
	const activePreset = PRESETS.find(p => p.value === initialPresetVal) ?? DEFAULT_PRESET;
	const isCustom = activePreset.value === "custom";
	const [changed, setChanged] = useState(false);

	// 2. Restore individual options with pre-parsed object
	const savedOptionsObj = getSavedOptions("options");

	const invalidFieldsMap: Record<string, boolean> = {};
	const recordInvalid = (key: string) => {
		if (isVersionChangeRef.current) {
			invalidFieldsMap[key] = true;
		}
	};

	// 3. States initialization
	const [selectedPresetVal, setSelectedPresetVal] = useState(initialPresetVal);
	const markAsCustom = () => {
		setSelectedPresetVal("custom");
		setChanged(true);
	};

	const [template, setTemplate] = useState(() => {
		const saved = isCustom ? storage.get("template") : null;
		return saved ?? activePreset.template;
	});

	const [keyPreset, setKeyPreset] = useState(() => {
		const val = getInitialVal(isCustom, savedOptionsObj, "keyPreset", activePreset.options.keyPreset, v => typeof v === "string", () => recordInvalid("keyPreset"));
		return getKeyPreset(val) ?? getKeyPreset(activePreset.options.keyPreset);
	});

	const [keyPattern, setKeyPattern] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "key", activePreset.options.key, v => typeof v === "string", () => recordInvalid("key"));
	});

	const [openDelim, setOpenDelim] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "open", activePreset.options.open, v => typeof v === "string", () => recordInvalid("open"));
	});

	const [closeDelim, setCloseDelim] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "close", activePreset.options.close, v => typeof v === "string", () => recordInvalid("close"));
	});

	const [enableSpacing, setEnableSpacing] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "enableSpacing", activePreset.options.enableSpacing, v => typeof v === "boolean", () => recordInvalid("enableSpacing"));
	});

	const [spacingStrict, setSpacingStrict] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "spacingStrict", activePreset.options.spacingStrict, v => typeof v === "boolean", () => recordInvalid("spacingStrict"));
	});

	const [spacingSize, setSpacingSize] = useState(() => {
		return getInitialVal(
			isCustom,
			savedOptionsObj,
			"spacingSize",
			activePreset.options.spacingSize,
			v => Array.isArray(v) && v.length === 2 && typeof v[0] === "number" && typeof v[1] === "number",
			() => recordInvalid("spacingSize"),
		);
	});

	const [fallbackType, setFallbackType] = useState<PrimitiveDataType>(() => {
		return getInitialVal<PrimitiveDataType>(
			isCustom,
			savedOptionsObj,
			"fallbackType",
			activePreset.options.fallbackType,
			v => typeof v === "string",
			() => recordInvalid("fallbackType"),
		);
	});

	const [fallback, setFallback] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "fallback", activePreset.options.fallback, v => typeof v === "string", () => recordInvalid("fallback"));
	});

	const [fallbackValues, setFallbackValues] = useState<Partial<Record<PrimitiveDataType, string>>>(() => {
		const currentType = getInitialVal<PrimitiveDataType>(
			isCustom,
			savedOptionsObj,
			"fallbackType",
			activePreset.options.fallbackType,
			v => typeof v === "string",
		);
		const currentVal = getInitialVal(isCustom, savedOptionsObj, "fallback", activePreset.options.fallback, v => typeof v === "string");
		return {
			[currentType]: currentVal,
		};
	});

	const [depth, setDepth] = useState(() => {
		return getInitialVal(isCustom, savedOptionsObj, "depth", activePreset.options.depth, v => typeof v === "number", () => recordInvalid("depth"));
	});

	const [codeFormat, setCodeFormat] = useState<"CommonJS" | "ES Modules">("ES Modules");

	const [rootType, setRootType] = useState<"object" | "array">(() => {
		const saved = isCustom ? storage.get("root-type") : null;
		return saved === "array" ? "array" : "object";
	});

	// validation
	const invalidSpacingSize = enableSpacing && spacingSize[1] >= 0 && spacingSize[0] > spacingSize[1];

	// data list state
	const [dataItems, setDataItems] = useState<DataItem[]>(() => {
		const saved = isCustom ? storage.get("data-items") : null;
		return saved ? JSON.parse(saved) as DataItem[] : activePreset.data;
	});

	const [invalidFields, setInvalidFields] = useState<Record<string, boolean>>(() => invalidFieldsMap);

	// 4. Auto Save Effects
	useEffect(() => {
		storage.set("selected-preset", selectedPresetVal);
	}, [selectedPresetVal]);

	useEffect(() => {
		storage.set("template", template);
	}, [template]);

	useEffect(() => {
		storage.set("root-type", rootType);
	}, [rootType]);

	useEffect(() => {
		storage.set("data-items", JSON.stringify(sanitizeDataItems(dataItems)));
	}, [dataItems]);

	useEffect(() => {
		if (isVersionChangeRef.current) {
			const invalidKeys = Object.keys(invalidFields).filter(k => invalidFields[k]);
			if (invalidKeys.length > 0) {
				toast.add({
					type       : "error",
					title      : "Version Compatibility",
					description: "Some invalid options were restored to their defaults.",
				});
			}
			isVersionChangeRef.current = false;
		}
	}, [invalidFields, isVersionChangeRef]);

	useEffect(() => {
		const optionsObj = {
			keyPreset: keyPreset?.value,
			key      : keyPattern,
			open     : openDelim,
			close    : closeDelim,
			enableSpacing,
			spacingStrict,
			spacingSize,
			fallbackType,
			fallback,
			depth,
		};
		storage.set("options", JSON.stringify(optionsObj));
	}, [
		keyPreset,
		keyPattern,
		openDelim,
		closeDelim,
		enableSpacing,
		spacingStrict,
		spacingSize,
		fallbackType,
		fallback,
		depth,
	]);

	// preset change handler
	const handlePresetChange = (value: string | null) => {
		if (!value) return;

		if (changed) {
			const isOK = confirm("This will overwrite your custom modifications. Do you want to proceed?");
			if (!isOK) return;
		}

		setSelectedPresetVal(value);
		setInvalidFields({});
		setChanged(false);
		const preset = PRESETS.find(p => p.value === value);
		if (preset) {
			setTemplate(preset.template);
			setKeyPreset(getKeyPreset(preset.options.keyPreset));
			setKeyPattern(preset.options.key);
			setOpenDelim(preset.options.open);
			setCloseDelim(preset.options.close);
			setEnableSpacing(preset.options.enableSpacing);
			setSpacingStrict(preset.options.spacingStrict);
			setSpacingSize(preset.options.spacingSize);
			setFallbackType(preset.options.fallbackType);
			setFallback(preset.options.fallback);
			setFallbackValues({ [preset.options.fallbackType]: preset.options.fallback });
			setDepth(preset.options.depth);
			setDataItems(preset.data);
			setRootType("object");
		}
	};

	// data management
	const addDataItem = () => {
		const newItem: DataItem = {
			id   : generateUUID(),
			key  : "",
			value: "",
			type : "string",
		};
		setDataItems([...dataItems, newItem]);
		markAsCustom();
	};

	const updateDataItem = (id: string, updates: Partial<DataItem>) => {
		setDataItems(prev => updateItemInTree(prev, id, updates));
		markAsCustom();
	};

	const removeDataItem = (id: string) => {
		setDataItems(prev => removeItemFromTree(prev, id));
		markAsCustom();
	};

	const addChildDataItem = (parentId: string, type: DataType) => {
		const findParent = (list: DataItem[]): DataItem | undefined => {
			for (const item of list) {
				if (item.id === parentId) return item;
				if (item.children) {
					const p = findParent(item.children);
					if (p) return p;
				}
			}
			return undefined;
		};

		const parent = findParent(dataItems);
		const parentType = parent?.type;
		const childrenLength = parent?.children?.length ?? 0;
		const defaultKey = parentType === "array" ? String(childrenLength) : "";

		const newItem: DataItem = {
			id   : generateUUID(),
			key  : defaultKey,
			value: type === "boolean" ? "false" : type === "null" || type === "array" || type === "object" ? undefined : "",
			type : type,
		};
		setDataItems(prev => addChildToItemInTree(prev, parentId, newItem));
		markAsCustom();
	};

	const handleOptionChange = <
		V,
	>(
		setter: React.Dispatch<React.SetStateAction<V>>,
		value: React.SetStateAction<V>,
		key?: string,
	) => {
		setter(value);
		markAsCustom();
		if (key) {
			setInvalidFields(prev => ({ ...prev, [key]: false }));
		}
	};

	// outputs
	const {
		renderedOutput,
		extractedKeys,
		extractedPlaceholders,
		extractedGroups,
		errorMsg,
	} = (() => {
		let oString = "";
		let kList: string[] = [];
		let pList: string[] = [];
		let gObj: Record<string, string[]> = {};
		let err: string | null = null;

		try {
			const context = buildContext(dataItems, rootType);

			// RegExp 검증 및 생성
			let parsedKey: RegExp | string | undefined = undefined;
			if (keyPreset?.value === "shallow") {
				parsedKey = KEY_PATTERNS.SHALLOW;
			} else if (keyPreset?.value === "deep") {
				parsedKey = KEY_PATTERNS.DEEP;
			} else if (keyPreset?.value === "custom" && keyPattern.trim()) {
				parsedKey = new RegExp(keyPattern.trim());
			}

			const options = {
				key    : parsedKey,
				open   : openDelim,
				close  : closeDelim,
				spacing: !enableSpacing
					? undefined
					: {
						strict: spacingStrict,
						size  : spacingSize,
					},
				fallback: resolveDataValue(fallbackType, fallback),
				depth   : depth,
			};

			const c = compile(template, options);
			kList = c.keys;
			pList = c.placeholders;
			gObj = c.groups;
			oString = c.render(context);
		} catch (e: unknown) {
			err = e instanceof Error ? e.message : String(e);
		}

		return {
			renderedOutput       : oString,
			extractedKeys        : kList,
			extractedPlaceholders: pList,
			extractedGroups      : gObj,
			errorMsg             : err,
		};
	})();

	// generated js code
	const generatedCode = (() => {
		const hasKeyPattern = keyPreset?.value === "shallow";

		const importStmt = codeFormat === "CommonJS"
			? `const { compile${hasKeyPattern ? ", KEY_PATTERNS" : ""} } = require("@kimzuni/templify");`
			: `import { compile${hasKeyPattern ? ", KEY_PATTERNS" : ""} } from "@kimzuni/templify";`;

		// template escape
		const escapedTemplate = template.replace(/`/g, "\\`").replace(/\${/g, "\\${");

		// context json render
		const contextStr = JSON.stringify(buildContext(dataItems, rootType), null, 2);

		// options text
		const optionLines: string[] = [];

		if (keyPreset?.value === "shallow") {
			optionLines.push("  key: KEY_PATTERNS.SHALLOW");
		} else if (keyPreset?.value === "custom" && keyPattern.trim() && keyPattern.trim() !== KEY_PATTERNS.DEEP.source) {
			optionLines.push(`  key: /${keyPattern.trim()}/`);
		}

		if (openDelim && openDelim !== "{") {
			optionLines.push(`  open: ${JSON.stringify(openDelim)}`);
		}
		if (closeDelim && closeDelim !== "}") {
			optionLines.push(`  close: ${JSON.stringify(closeDelim)}`);
		}

		if (enableSpacing) {
			const sizeStr = Array.isArray(spacingSize) ? `[${spacingSize.join(", ")}]` : spacingSize;
			optionLines.push(`  spacing: {\n    strict: ${spacingStrict},\n    size: ${sizeStr}\n  }`);
		}

		const resolvedFallbackVal = resolveDataValue(fallbackType, fallback);
		if (resolvedFallbackVal !== undefined) {
			optionLines.push(`  fallback: ${JSON.stringify(resolvedFallbackVal)}`);
		}

		if (depth !== -1) {
			optionLines.push(`  depth: ${depth}`);
		}

		const optionsStr = optionLines.length > 0
			? `{\n${optionLines.join(",\n")}\n}`
			: "{}";

		const lines = [
			importStmt,
			"",
			`const template = \`${escapedTemplate}\`;`,
			"",
			`const context = ${contextStr};`,
			"",
			`const options = ${optionsStr};`,
			"",
			"const c = compile(template, options);",
			"const keys = c.keys;",
			"const placeholders = c.placeholders;",
			"const groups = c.groups;",
			"const result = c.render(context);",
		];

		return lines.join("\n");
	})();

	return (
		<PlaygroundLayout
			presetsSection={
				<Section
					heading="Presets"
					className="w-full"
				>
					<Select items={PRESETS} value={selectedPresetVal} onValueChange={handlePresetChange}>
						<SelectTrigger className="w-full">
							<SelectValue/>
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{PRESETS.map(item => (
									<SelectItem key={item.value} value={item.value}>
										{item.label}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Section>
			}



			optionsSection={
				<Section
					collapsible={isMobile}
					heading="Options"
					sectionContentProps={{
						className: "pt-4 **:[legend]:mb-3!",
					}}
				>
					{/* Delimiters */}
					<FieldSet>
						<FieldLegend description="Opening/Closing delimiter for placeholders.">
							Delimiter
						</FieldLegend>
						<FieldGroup className="flex-row">
							<OptionInput
								label="Open"
								id="opt-open"
								value={openDelim}
								onChange={e => handleOptionChange(setOpenDelim, e.target.value, "open")}
								placeholder="{"
								invalid={invalidFields.open}
							/>

							<OptionInput
								label="Close"
								id="opt-close"
								value={closeDelim}
								onChange={e => handleOptionChange(setCloseDelim, e.target.value, "close")}
								placeholder="}"
								invalid={invalidFields.close}
							/>
						</FieldGroup>
					</FieldSet>

					<Separator/>

					{/* Key Pattern */}
					<FieldSet>
						<FieldLegend
							description={<>
								Regex pattern defining valid characters for placeholder keys.
								Controls which characters are allowed inside the delimiters.
							</>}
						>
							Key
						</FieldLegend>
						<FieldGroup className="gap-3">
							<OptionSelect
								label="Preset"
								id="opt-key-pattern-type"
								items={KEY_PRESETS}
								value={keyPreset}
								onValueChange={item => handleOptionChange(setKeyPreset, item ?? undefined, "keyPreset")}
								invalid={invalidFields.keyPreset}
							/>

							<OptionInput
								label="Pattern"
								id="opt-key"
								value={
									keyPreset?.value === "shallow"
										? KEY_PATTERNS.SHALLOW.source
										: keyPreset?.value === "deep"
											? KEY_PATTERNS.DEEP.source
											: keyPattern
								}
								onChange={e => handleOptionChange(setKeyPattern, e.target.value, "key")}
								placeholder={KEY_PATTERNS.DEFAULT.source}
								disabled={keyPreset?.value !== "custom"}
								invalid={invalidFields.key}
							/>
						</FieldGroup>
					</FieldSet>

					<Separator/>

					{/* Spacing Option */}
					<FieldSet>
						<FieldLegend description="Options for controlling the number of spaces inside template placeholders.">
							Spacing
						</FieldLegend>
						<FieldGroup className="grid grid-cols-2 gap-3 *:nth-1:col-span-full *:nth-2:col-span-full">
							<OptionCheckbox
								label="Enable"
								id="opt-enable-spacing"
								checked={enableSpacing}
								onCheckedChange={checked => handleOptionChange(setEnableSpacing, checked, "enableSpacing")}
							/>

							<OptionCheckbox
								label="Strict mode"
								description="Placeholders must have the same number of spaces on both sides of the key to be considered a valid match."
								id="opt-spacing-strict"
								checked={spacingStrict}
								onCheckedChange={checked => handleOptionChange(setSpacingStrict, checked, "spacingStrict")}
								disabled={!enableSpacing}
							/>

							<OptionInput
								label="Minimum"
								id="opt-spacing-min"
								type="number"
								min={-1}
								value={spacingSize[0]}
								onChange={e => handleOptionChange(
									setSpacingSize,
									p => [Number(e.target.value), p[1]] as [number, number],
									"spacingSize",
								)}
								placeholder="0"
								disabled={!enableSpacing}
								invalid={invalidSpacingSize || invalidFields.spacingSize}
							/>

							<OptionInput
								label="Maximum"
								id="opt-spacing-max"
								type="number"
								min={-1}
								value={spacingSize[1]}
								onChange={e => handleOptionChange(
									setSpacingSize,
									p => [p[0], Number(e.target.value)] as [number, number],
									"spacingSize",
								)}
								placeholder="-1"
								disabled={!enableSpacing}
								invalid={invalidSpacingSize || invalidFields.spacingSize}
							/>

							{invalidSpacingSize && (
								<FieldDescription className="text-destructive col-span-full">
									Maximum must be -1 or greater than or equal to Minimum
								</FieldDescription>
							)}
						</FieldGroup>
					</FieldSet>

					<Separator/>

					{/* Fallback */}
					<FieldSet>
						<FieldLegend description="Fallback value to use when a template key is missing.">
							Fallback
						</FieldLegend>
						<FieldGroup className="flex-row flex-wrap items-center gap-2">
							<ValueSelect
								type={fallbackType}
								items={["string", "number", "boolean", "null", "undefined"]}
								value={fallback}
								values={fallbackValues}
								onValueChange={(nextType, nextValue, nextValues) => {
									setFallbackType(nextType as PrimitiveDataType);
									setFallback(nextValue ?? "");
									setFallbackValues(nextValues);
									markAsCustom();
									setInvalidFields(prev => ({ ...prev, fallbackType: false, fallback: false }));
								}}
								className="w-full"
								invalid={invalidFields.fallbackType ?? invalidFields.fallback}
							/>
							<ValueInput
								type={fallbackType}
								value={fallback}
								onValueChange={(nextValue) => {
									setFallback(nextValue);
									setFallbackValues(prev => ({
										...prev,
										[fallbackType]: nextValue,
									}));
									markAsCustom();
									setInvalidFields(prev => ({ ...prev, fallback: false }));
								}}
								className="flex-1"
								invalid={invalidFields.fallback}
							/>
						</FieldGroup>
					</FieldSet>
				</Section>
			}



			dataSection={
				<Section
					heading={
						<div className="flex items-center gap-3 mb-1">
							<span>Data with</span>
							<ValueSelect
								type={rootType}
								items={["array", "object"]}
								className="flex-1"
								onValueChange={(val) => {
									if (val === "array" || val === "object") {
										setRootType(val);
										markAsCustom();
									}
								}}
							/>
							<div className="flex justify-end-safe *:w-fit">
								<OptionInput
									label="Depth"
									id="opt-depth"
									type="number"
									min={-1}
									value={depth}
									orientation="horizontal"
									className="w-16"
									onChange={e => handleOptionChange(setDepth, Number(e.target.value), "depth")}
									invalid={invalidFields.depth}
								/>
							</div>
						</div>
					}
					afterScrollArea={<AddButton className="w-full" label="Add Item" onClick={addDataItem}/>}
					sectionContentProps={{
						className: "overflow-hidden",
					}}
				>
					{/* Scrollable list of items */}
					<div className="w-full flex flex-col gap-2.5 overflow-y-auto">
						{dataItems.map((item, idx) => (
							<DataItemRow
								key={item.id}
								item={item}
								depth={0}
								parentType={rootType}
								index={idx}
								onUpdate={updateDataItem}
								onRemove={removeDataItem}
								onAddChild={addChildDataItem}
							/>
						))}

						{dataItems.length === 0 && (
							<Alert className="border-dashed py-6 text-center!">
								<AlertDescription>Data items are empty. Try adding an item.</AlertDescription>
							</Alert>
						)}
					</div>
				</Section>
			}



			templateSection={
				<section>
					<TextArea
						copyButton
						label="Template"
						id="template-string"
						placeholder="Enter template..."
						value={template}
						onChange={(e) => {
							setTemplate(e.target.value);
							markAsCustom();
						}}
						onCopyError={err => toast.add({
							type       : "error",
							title      : "Template copy failed",
							description: err.message,
						})}
						viewportProps={{
							className: "max-h-64",
						}}
					/>
				</section>
			}



			resultSection={
				<section>
					<TextArea
						readOnly
						copyButton
						label="Rendered Output"
						id="template-rendered-output"
						placeholder="Rendering result will be shown here..."
						value={errorMsg ?? renderedOutput}
						invalid={errorMsg !== null}
						onCopyError={err => toast.add({
							type       : "error",
							title      : "Result copy failed",
							description: err.message,
						})}
						viewportProps={{
							className: "max-h-64",
						}}
					/>
				</section>
			}



			tabsSection={
				<section
					className={cn(
						"flex flex-col",
						"**:data-[slot=tabs-content]:font-mono",
						"not-xl:h-[calc(100svh-4rem)]",
						"not-xl:**:data-[slot=tabs-content]:grow-0",
						"not-xl:**:data-[slot=tabs-content]:basis-auto",
					)}
				>
					<Tabs
						defaultValue="overview"
						value={tabValue}
						onValueChange={setTabValue}
						className="flex-1 flex flex-col gap-0 min-h-0"
					>
						<TabsList variant="line" className="px-2">
							{TABS.map(item => (
								<TabsTrigger
									key={item}
									value={item}
									className="capitalize cursor-pointer"
								>{item}</TabsTrigger>
							))}
						</TabsList>

						{/* Code */}
						<BaseTabsContent value="code" className="flex flex-col gap-3 -m-1 p-1 overflow-hidden" tabIndex={-1}>
							<TextArea
								value={generatedCode}
								id="generated-code"
								readOnly
								copyButton
								onCopyError={err => toast.add({
									type       : "error",
									title      : "Code copy failed",
									description: err.message,
								})}
								label={
									<Select
										value={codeFormat}
										onValueChange={(val: typeof codeFormat | null) => {
											if (val) setCodeFormat(val);
										}}
									>
										<SelectTrigger>
											<SelectValue/>
										</SelectTrigger>
										<SelectContent className="font-mono">
											<SelectGroup>
												<SelectItem value="CommonJS">CommonJS</SelectItem>
												<SelectItem value="ES Modules">ES Modules</SelectItem>
											</SelectGroup>
										</SelectContent>
									</Select>
								}
							/>
						</BaseTabsContent>

						{/* Keys */}
						<TabsContent value="keys" className="flex flex-wrap gap-2.5 overflow-y-auto">
							{extractedKeys.map(key => (
								<Badge key={key} variant="secondary">
									{key}
								</Badge>
							))}
							{extractedKeys.length === 0 && (
								<Alert className="border-0 p-0 italic">
									<AlertDescription>No keys detected.</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						{/* Placeholders */}
						<TabsContent value="placeholders" className="flex flex-wrap gap-2.5 overflow-y-auto">
							{extractedPlaceholders.map((placeholder, idx) => (
								<Badge key={idx} variant="secondary">
									{placeholder}
								</Badge>
							))}
							{extractedPlaceholders.length === 0 && (
								<Alert className="border-0 p-0 italic">
									<AlertDescription>No placeholders detected.</AlertDescription>
								</Alert>
							)}
						</TabsContent>

						{/* Placeholder Groups */}
						<TabsContent value="groups" className="flex flex-col gap-2.5 overflow-y-auto">
							{Object.entries(extractedGroups).map(([key, value]) => (
								<div key={key} className="flex flex-col gap-2.5 not-first:border-t not-first:pt-3">
									<span className="text-xs font-bold text-muted-foreground">Key: {key}</span>
									<div className="flex flex-wrap gap-2.5">
										{value.map((placeholder, idx) => (
											<Badge key={idx} variant="secondary">
												{placeholder}
											</Badge>
										))}
									</div>
								</div>
							))}
							{Object.keys(extractedGroups).length === 0 && (
								<Alert className="border-0 p-0 italic">
									<AlertDescription>No grouped items.</AlertDescription>
								</Alert>
							)}
						</TabsContent>
					</Tabs>
				</section>
			}
		/>
	);
}
