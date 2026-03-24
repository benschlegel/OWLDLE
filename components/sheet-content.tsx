import { SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';

export default function HamburgerSheetContent() {
	return (
		<SheetContent side="right">
			<SheetHeader>
				<SheetTitle>Edit profile</SheetTitle>
				<SheetDescription>Make changes to your profile here. Click save when you're done.</SheetDescription>
			</SheetHeader>
		</SheetContent>
	);
}
