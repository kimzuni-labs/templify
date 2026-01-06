import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import stylistic from "@stylistic/eslint-plugin";
import { defineConfig } from "eslint/config";

import tsconfig from "./tsconfig.base.json" with { type: "json" };



export default defineConfig(
	{
		ignores: tsconfig.exclude,
	},
	{
		extends: [
			eslint.configs.recommended,
		],
		rules: {
		},
	},
	{
		languageOptions: {
			parser       : tseslint.parser,
			parserOptions: {
				projectService: true,
			},
		},
		extends: [
			tseslint.configs.strictTypeChecked,
			tseslint.configs.stylisticTypeChecked,
		],
		rules: {
			"@typescript-eslint/no-empty-object-type": [
				"error",
				{
					allowInterfaces : "with-single-extends",
					allowObjectTypes: "never",
				},
			],
			"@typescript-eslint/restrict-template-expressions": [
				"error",
				{
					allowAny    : false,
					allowBoolean: true,
					allowNever  : false,
					allowNullish: true,
					allowNumber : true,
					allowRegExp : false,
				},
			],
		},
	},
	{
		plugins: {
			"@stylistic": stylistic,
		},
		rules: {
			// https://eslint.style/packages/default#rules
			"@stylistic/array-bracket-newline"         : ["error", "consistent"],
			"@stylistic/array-bracket-spacing"         : ["error", "never"],
			"@stylistic/array-element-newline"         : ["error", { consistent: true, multiline: true }],
			"@stylistic/arrow-parens"                  : ["error", "as-needed", { requireForBlockBody: true }],
			"@stylistic/arrow-spacing"                 : ["error", { before: true, after: true }],
			"@stylistic/block-spacing"                 : ["error", "always"],
			"@stylistic/brace-style"                   : ["error", "1tbs", { allowSingleLine: true }],
			"@stylistic/comma-dangle"                  : ["error", "always-multiline"],
			"@stylistic/comma-spacing"                 : ["error", { before: false, after: true }],
			"@stylistic/comma-style"                   : ["error", "last"],
			"@stylistic/computed-property-spacing"     : ["error", "never"],
			"@stylistic/curly-newline"                 : ["error", { consistent: true }],
			"@stylistic/dot-location"                  : ["error", "property"],
			"@stylistic/eol-last"                      : ["error", "always"],
			"@stylistic/function-call-argument-newline": ["error", "consistent"],
			"@stylistic/function-call-spacing"         : ["error", "never"],
			"@stylistic/function-paren-newline"        : ["error", "multiline"],
			"@stylistic/generator-star-spacing"        : ["error", { before: true, after: false }],
			"@stylistic/implicit-arrow-linebreak"      : ["error", "beside"],
			"@stylistic/indent"                        : ["error", "tab"],
			"@stylistic/indent-binary-ops"             : ["error", "tab"],
			"@stylistic/key-spacing"                   : [
				"error",
				{
					align: {
						on         : "colon",
						mode       : "minimum",
						beforeColon: false,
						afterColon : true,
					},
				},
			],
			"@stylistic/keyword-spacing"      : ["error", { before: true, after: true }],
			"@stylistic/line-comment-position": ["error", { position: "above" }],
			"@stylistic/linebreak-style"      : ["error", "unix"],
			"@stylistic/lines-around-comment" : [
				"error",
				{
					beforeBlockComment  : true,
					afterBlockComment   : false,
					beforeLineComment   : true,
					afterLineComment    : false,
					allowBlockStart     : true,
					allowBlockEnd       : false,
					allowObjectStart    : true,
					allowObjectEnd      : false,
					allowArrayStart     : true,
					allowArrayEnd       : false,
					allowClassStart     : true,
					allowClassEnd       : false,
					allowEnumStart      : true,
					allowEnumEnd        : false,
					allowInterfaceStart : true,
					allowInterfaceEnd   : false,
					allowModuleStart    : true,
					allowModuleEnd      : false,
					allowTypeStart      : true,
					allowTypeEnd        : false,
					afterHashbangComment: true,
				},
			],
			"@stylistic/lines-between-class-members": [
				"error",
				{
					enforce: [{
						blankLine: "always",
						prev     : "method",
						next     : "method",
					}],
				},
			],
			"@stylistic/max-len": [
				"error",
				{
					code                  : 120,
					tabWidth              : 4,
					ignoreComments        : true,
					ignoreTrailingComments: false,
					ignoreUrls            : true,
					ignoreStrings         : true,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals  : true,
				},
			],
			"@stylistic/max-statements-per-line": ["error", { max: 3 }],
			"@stylistic/member-delimiter-style" : [
				"error",
				{
					multiline: {
						delimiter  : "semi",
						requireLast: true,
					},
					singleline: {
						delimiter  : "semi",
						requireLast: false,
					},
					multilineDetection: "brackets",
				},
			],
			"@stylistic/multiline-comment-style" : ["error", "starred-block"],
			"@stylistic/multiline-ternary"       : ["error", "always-multiline"],
			"@stylistic/new-parens"              : ["error", "always"],
			"@stylistic/newline-per-chained-call": ["error", { ignoreChainWithDepth: 2 }],
			"@stylistic/no-confusing-arrow"      : ["error", { allowParens: true }],
			"@stylistic/no-extra-parens"         : ["error", "all"],
			"@stylistic/no-extra-semi"           : ["error"],
			"@stylistic/no-floating-decimal"     : ["error"],
			"@stylistic/no-mixed-operators"      : ["error"],
			"@stylistic/no-mixed-spaces-and-tabs": ["error"],
			"@stylistic/no-multi-spaces"         : [
				"error",
				{
					exceptions: {
						PropertyDefinition : true,
						TSPropertySignature: true,
					},
				},
			],
			"@stylistic/no-multiple-empty-lines"         : ["error", { max: 3, maxEOF: 0, maxBOF: 0 }],
			"@stylistic/no-tabs"                         : ["error", { allowIndentationTabs: true }],
			"@stylistic/no-trailing-spaces"              : ["error", { skipBlankLines: false, ignoreComments: false }],
			"@stylistic/no-whitespace-before-property"   : ["error"],
			"@stylistic/nonblock-statement-body-position": ["error", "beside"],
			"@stylistic/object-curly-newline"            : ["error", { consistent: true }],
			"@stylistic/object-curly-spacing"            : ["error", "always"],
			"@stylistic/object-property-newline"         : ["error", { allowAllPropertiesOnSameLine: true }],
			"@stylistic/one-var-declaration-per-line"    : ["error", "always"],
			"@stylistic/operator-linebreak"              : ["error", "before"],
			"@stylistic/padded-blocks"                   : ["error", "never"],
			"@stylistic/padding-line-between-statements" : ["off"],
			"@stylistic/quote-props"                     : ["error", "as-needed"],
			"@stylistic/quotes"                          : ["error", "double"],
			"@stylistic/rest-spread-spacing"             : ["error", "never"],
			"@stylistic/semi"                            : ["error", "always"],
			"@stylistic/semi-spacing"                    : ["error", { before: false, after: true }],
			"@stylistic/semi-style"                      : ["error", "last"],
			"@stylistic/space-before-blocks"             : ["error", "always"],
			"@stylistic/space-before-function-paren"     : ["error", { anonymous: "never", named: "never", asyncArrow: "always" }],
			"@stylistic/space-in-parens"                 : ["error", "never"],
			"@stylistic/space-infix-ops"                 : ["error"],
			"@stylistic/space-unary-ops"                 : ["error", { words: true, nonwords: false }],
			"@stylistic/spaced-comment"                  : [
				"error",
				"always",
				{
					line : { exceptions: ["/"] },
					block: { exceptions: ["*"] },
				},
			],
			"@stylistic/switch-colon-spacing"   : ["error", { before: false, after: true }],
			"@stylistic/template-curly-spacing" : ["error", "never"],
			"@stylistic/template-tag-spacing"   : ["error", "never"],
			"@stylistic/type-annotation-spacing": [
				"off",
				{
					before   : true,
					after    : true,
					overrides: {
						colon: {
							before: false,
							after : true,
						},
					},
				},
			],
			"@stylistic/type-generic-spacing"    : ["error"],
			"@stylistic/type-named-tuple-spacing": ["error"],
			"@stylistic/wrap-iife"               : ["error", "inside"],
			"@stylistic/wrap-regex"              : ["error"],
			"@stylistic/yield-star-spacing"      : ["error", { before: false, after: true }],
		},
	},
);
