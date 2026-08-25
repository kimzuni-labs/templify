/* eslint-disable @stylistic/line-comment-position */

import { cn } from "@/lib/utils";



// nth 1~6
export interface PlaygroundLayoutProps {
	presetsSection : React.ReactNode;
	optionsSection : React.ReactNode;
	dataSection    : React.ReactNode;
	templateSection: React.ReactNode;
	resultSection  : React.ReactNode;
	tabsSection    : React.ReactNode;
}

export function PlaygroundLayout({
	presetsSection,
	optionsSection,
	dataSection,
	templateSection,
	resultSection,
	tabsSection,
}: PlaygroundLayoutProps) {
	return (
		<main
			className={cn(
				"[--gap:--spacing(6)]",
				"md:[--ph:108px]", // preset height
				"md:[--oh:680px]", // options height
				"xl:[--th:200px]", // template & result textarea height
				"xl:[--thd:calc(var(--th)-var(--ph)-var(--gap))]", // for template text area height

				"flex-1 grid gap-(--gap) py-6 px-4",
				"not-md:**:data-[slot=collapsible-content]:max-h-[75svh]",

				// one line
				"grid-cols-1",

				// options and data editor horizontal
				"md:grid-rows-[var(--ph)_var(--oh)_repeat(3,minmax(0,auto))]",
				"md:grid-cols-[minmax(0,9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,9fr)]",
				"md:*:nth-1:row-start-1 md:*:nth-1:col-start-1 md:*:nth-1:row-span-1 md:*:nth-1:col-span-1",
				"md:*:nth-2:row-start-2 md:*:nth-2:col-start-1 md:*:nth-2:row-span-1 md:*:nth-2:col-span-1",
				"md:*:nth-3:row-start-1 md:*:nth-3:col-start-2 md:*:nth-3:row-span-2 md:*:nth-3:col-span-full",
				"md:*:nth-4:row-start-3 md:*:nth-4:col-start-1 md:*:nth-4:row-span-1 md:*:nth-4:col-span-full",
				"md:*:nth-5:row-start-4 md:*:nth-5:col-start-1 md:*:nth-5:row-span-1 md:*:nth-5:col-span-full",
				"md:*:nth-6:row-start-5 md:*:nth-6:col-start-1 md:*:nth-6:row-span-1 md:*:nth-6:col-span-full",

				// 64px: header height
				// 24px: main padding top/bottom
				"xl:grid-rows-[var(--ph)_var(--thd)_var(--th)_minmax(300px,calc(100svh-64px-24px*2-var(--ph)-var(--thd)-var(--th)-var(--gap)*3))]",

				// |---------------------|----------|
				// |       presets       |          |
				// |---------------------| template |
				// |          |          |----------|
				// |          |          |  render  |
				// | options  |   data   |----------|
				// |          |          |   tabs   |
				// |          |          |          |
				// |---------------------|----------|
				"xl:grid-cols-[minmax(0,9fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,9fr)_minmax(0,12fr)_minmax(0,12fr)]",
				"xl:*:nth-1:row-start-1 xl:*:nth-1:col-start-1 xl:*:nth-1:row-span-1 xl:*:nth-1:col-span-1",
				"xl:*:nth-2:row-start-2 xl:*:nth-2:col-start-1 xl:*:nth-2:row-span-full xl:*:nth-2:col-span-1",
				"xl:*:nth-3:row-start-1 xl:*:nth-3:col-start-2 xl:*:nth-3:row-span-full xl:*:nth-3:col-span-3",
				"xl:*:nth-4:row-start-1 xl:*:nth-4:col-start-5 xl:*:nth-4:row-span-2 xl:*:nth-4:col-span-2",
				"xl:*:nth-5:row-start-3 xl:*:nth-5:col-start-5 xl:*:nth-5:row-span-1 xl:*:nth-5:col-span-2",
				"xl:*:nth-6:row-start-4 xl:*:nth-6:col-start-5 xl:*:nth-6:row-span-1 xl:*:nth-6:col-span-2",
			)}
		>
			{presetsSection}
			{optionsSection}
			{dataSection}
			{templateSection}
			{resultSection}
			{tabsSection}
		</main>
	);
}
