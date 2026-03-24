'use client';
import { type LucideIcon, SettingsIcon } from 'lucide-react';
import { type ComponentProps, useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/store/settings-store';
import { Switch } from '@/components/ui/switch';

type Props = {
	setOpen: (value: boolean) => void;
};

export default function SettingsContent({ setOpen }: Props) {
	return (
		<DialogContent className="sm:max-w-xl sm:py-6 sm:px-7" aria-describedby="Change system settings.">
			<DialogHeader>
				<DialogTitle className="flex flex-row gap-2 items-center text-left">
					<SettingsIcon className="h-[1.3rem] w-[1.3rem] opacity-80" />
					<span>Settings</span>
				</DialogTitle>
			</DialogHeader>
			<div className="flex flex-col gap-2">
				<SettingsEntries />
			</div>
		</DialogContent>
	);
}

function SettingsEntries() {
	const isBackgroundEnabled = useSettings((s) => s.isBackgroundEnabled);
	const setIsBackgroundEnabled = useSettings((s) => s.setIsBackgroundEnabled);

	const onBackgroundSwitch = useCallback(
		(newState: boolean) => {
			setIsBackgroundEnabled(newState);
		},
		[setIsBackgroundEnabled]
	);

	return (
		<>
			<SettingsSwitchEntry
				label="Show background"
				id="background"
				onSwitch={onBackgroundSwitch}
				initialChecked={isBackgroundEnabled}
				description="Whether to show background or not."
			/>
		</>
	);
}

type SwitchEntryProps = {
	label: string;
	description?: string;
	id: string;
	onSwitch?: (state: boolean) => void;
	initialChecked?: boolean;
	disabled?: boolean;
};

function SettingsSwitchEntry({ label, description, id, onSwitch, initialChecked = false, disabled = false }: SwitchEntryProps) {
	const [checked, setChecked] = useState(initialChecked);

	const onCheckedChange = useCallback(
		(state: boolean) => {
			setChecked(state);
			if (onSwitch) {
				onSwitch(state);
			}
		},
		[onSwitch]
	);

	return (
		// Render inside of label so entire area is clickable
		<Label
			htmlFor={`settings-${id}-switch`}
			data-disabled={disabled}
			className="flex text-foreground/80 data-[disabled=true]:opacity-60 data-[disabled=true]:cursor-not-allowed cursor-pointer flex-row items-center justify-between rounded-sm bg-muted py-3 px-4">
			<div className="flex flex-col gap-1">
				<div>{label}</div>
				{description && <div className="text-xs text-muted-foreground">{description}</div>}
			</div>
			<Switch disabled={disabled} checked={checked} id={`settings-${id}-switch`} onCheckedChange={onCheckedChange} />
		</Label>
	);
}

type SelectEntryProps = {
	label: string;
	id: string;
	description?: string;
	onSelect?: (value: string) => void;
	initialValue?: string;
	entries: SelectEntry[];
	disabled?: boolean;
	placeholder?: string;
};

type SelectEntry = {
	value: string;
	name: string;
};

function SettingsSelectEntry({ id, description, label, entries, initialValue, onSelect, placeholder = label, disabled = false }: SelectEntryProps) {
	const [value, setValue] = useState<string | undefined>(initialValue);

	const onValueSelect = useCallback(
		(newVal: string) => {
			setValue(newVal);
			if (onSelect) {
				onSelect(newVal);
			}
		},
		[onSelect]
	);

	return (
		<Label
			htmlFor={`settings-${id}-select`}
			data-disabled={disabled}
			className="flex text-foreground/80 data-[disabled=true]:opacity-60 data-[disabled=true]:cursor-not-allowed flex-row items-center justify-between rounded-sm bg-muted py-3 px-4">
			<div className="flex flex-col gap-1">
				<div>{label}</div>
				{description && <div className="text-xs text-muted-foreground">{description}</div>}
			</div>
			<Select defaultValue={initialValue} value={value} onValueChange={onValueSelect}>
				<SelectTrigger className="bg-background">
					<SelectValue placeholder={placeholder} />
				</SelectTrigger>
				<SelectContent>
					{entries.map((e) => (
						<SelectItem value={e.value} key={`difficulty-item-${e.value}`}>
							{e.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
		</Label>
	);
}

type ButtonEntryProps = {
	label: string;
	description?: string;
	id: string;
	onClick?: () => void;
	disabled?: boolean;
	buttonVariant?: ComponentProps<typeof Button>['variant'];
	buttonIcon?: LucideIcon;
	buttonLabel?: string;
	/**
	 * Overrides all other button props if set
	 */
	button?: React.ReactNode;
};
function SettingsButtonEntry(props: ButtonEntryProps) {
	const { id, label, description, disabled, onClick, buttonVariant, buttonLabel, button } = props;
	const onButtonClick = useCallback(() => {
		if (onClick) {
			onClick();
		}
	}, [onClick]);
	return (
		<div
			data-disabled={disabled}
			className="flex text-foreground/80 data-[disabled=true]:opacity-60 data-[disabled=true]:cursor-not-allowed flex-row items-center justify-between rounded-sm bg-muted py-3 px-4">
			<div className="flex flex-col gap-1">
				<Label htmlFor={`settings-${id}-button`}>{label}</Label>
				{description && <div className="text-xs text-muted-foreground">{description}</div>}
			</div>
			{button !== undefined ? (
				button
			) : (
				<Button variant={buttonVariant ?? 'default'} id={`settings-${id}-button`} onClick={onButtonClick} className="text-xs sm:text-sm">
					{buttonLabel && <span>{buttonLabel}</span>}
					{props.buttonIcon && <props.buttonIcon className="sm:block hidden" />}
				</Button>
			)}
		</div>
	);
}
