'use client';

import { useSettings } from '@/store/settings-store';

export default function Background() {
	const isBackgroundEnabled = useSettings((s) => s.isBackgroundEnabled);
	if (!isBackgroundEnabled) return null;
	return (
		<div className="h-full w-full -z-1 absolute bg-background overflow-hidden ">
			<div className="h-[200vh] w-[150vw] origin-left relative rotate-[-27.4deg] sm:block opacity-20 *:absolute *:skew-x-[-28deg]">
				<div className="top-[25%] left-[5%] w-75 h-[15px] bg-primary-foreground opacity-90" />
				<div className="top-[25%] left-[5%] w-75 h-[15px] bg-primary-foreground opacity-90" />
				<div className="top-[57%] left-[10%] w-120 h-5 bg-foreground opacity-60" />
				<div className="top-[40%] left-[15%] w-75 h-10 bg-slate-200 opacity-60" />
				<div className="top-[50%] left-[42%] w-120 h-[15px] bg-slate-200 opacity-50" />
				<div className="top-[35%] left-[24%] w-120 h-[15px] bg-slate-200 opacity-50" />
				<div className="top-[20%] left-[15%] w-120 h-[15px] bg-slate-200 opacity-60" />
				<div className="top-[70%] left-[60%] w-75 h-[15px] bg-slate-200 opacity-60" />
				<div className="top-[55%] left-[55%] w-95 h-[15px] bg-foreground opacity-60" />
				<div className="top-[45%] left-[0%] w-[200vh] h-[35px] bg-foreground opacity-10" />
				<div className="top-[15%] left-[0%] w-[200vh] h-[20px] bg-foreground opacity-10" />
				<div className="top-[30%] left-[0%] w-[200vh] h-[25px] bg-foreground opacity-15" />
				<div className="top-[67%] left-[0%] w-[200vh] h-[40px] bg-foreground opacity-20" />
				<div className="top-[72%] left-[55%] w-90 h-[20px] bg-primary-foreground opacity-90" />
				<div className="top-[50%] -left-px w-90 h-[20px] bg-primary-foreground opacity-90" />
				<div className="top-[75%] left-[0%] w-[200vh] h-[15px] bg-foreground opacity-10" />
				<div className="top-[61%] left-[49%] w-90 h-10 bg-foreground opacity-20" />
				<div className="top-[83%] left-[37%] w-90 h-10 bg-primary-foreground opacity-90" />
				<div className="top-[79%] left-[46%] w-120 h-3.75 bg-slate-200 opacity-60" />
			</div>
		</div>
	);
}
