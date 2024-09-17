import type { CSSProperties, PropsWithChildren } from 'react';

const AspectRatioContainer = ({ children, className = '', style }: PropsWithChildren<{ className?: string; style?: CSSProperties }>) => {
	return (
		<div className={`relative w-full ${className}`} style={style}>
			<div className="pb-[100%]" /> {/* Creates the 1:1 aspect ratio */}
			<div className="absolute top-0 left-0 w-full h-full">{children}</div>
		</div>
	);
};

export default AspectRatioContainer;
