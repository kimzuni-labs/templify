import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ui/theme-provider";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";



export function ModeToggle() {
	const { theme, setTheme } = useTheme();

	return (
		<DropdownMenu modal={false}>
			<DropdownMenuTrigger
				render={<Button variant="outline" size="icon" className="cursor-pointer">
					<Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90"/>
					<Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0"/>
					<span className="sr-only">Toggle theme</span>
				</Button>}
			/>
			<DropdownMenuContent align="end">
				<DropdownMenuRadioGroup value={theme} className="*:cursor-pointer">
					<DropdownMenuRadioItem value="light" onClick={() => setTheme("light")}>
						Light
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="dark" onClick={() => setTheme("dark")}>
						Dark
					</DropdownMenuRadioItem>
					<DropdownMenuRadioItem value="system" onClick={() => setTheme("system")}>
						System
					</DropdownMenuRadioItem>
				</DropdownMenuRadioGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
