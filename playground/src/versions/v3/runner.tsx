import { cn } from "@/lib/utils";

import { Section } from "@/components/section";



export default function V3() {
	return (
		<main
			className={cn(
				"flex-1",
				"grid grid-cols-1 lg:grid-rows-2",
				"lg:grid-cols-[minmax(20%,1fr)_minmax(30%,40%)_minmax(30%,40%)]",
			)}
		>
			<Section heading="Template" className="lg:col-start-2 lg:row-start-1">
				template section
			</Section>
			<Section heading="Options" className="lg:row-span-2 lg:col-start-1">
				options section
			</Section>
			<Section heading="Data" className="lg:col-start-2 lg:row-start-2">
				data section
			</Section>
			<Section heading="Render" className="lg:col-start-3 lg:row-start-1">
				render result section
			</Section>
			<Section heading="Tabs" className="lg:col-start-3 lg:row-start-2">
				code, keys, placeholders, groups
			</Section>
		</main>
	);
}
