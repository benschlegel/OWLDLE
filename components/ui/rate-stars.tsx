'use client';

import { useState, useCallback, useRef } from 'react';
import { cn } from '@/lib/utils';

interface StarIconProps {
	filled: number;
	hovered: boolean;
}

const StarIcon: React.FC<StarIconProps> = ({ filled, hovered }) => {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="currentColor"
			className={cn('w-6 h-6 transition-colors duration-200', hovered ? 'text-primary-foreground/70' : 'text-primary-foreground')}>
			<title>Star icon</title>
			<defs>
				<linearGradient id={`partialFill-${filled}`}>
					<stop offset={`${filled * 100}%`} stopColor="currentColor" />
					<stop offset={`${filled * 100}%`} stopColor="transparent" stopOpacity="0" />
				</linearGradient>
			</defs>
			<path
				fillRule="evenodd"
				d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
				fill={`url(#partialFill-${filled})`}
				stroke="currentColor"
				strokeWidth="1"
			/>
		</svg>
	);
};

interface StarRatingProps {
	onChange?: (rating: number) => void;
	className?: string;
}

export default function StarRating({ onChange, className }: StarRatingProps = {}) {
	const [rating, setRating] = useState(0);
	const [hoveredRating, setHoveredRating] = useState(0);
	const containerRef = useRef<HTMLDivElement>(null);

	const handleRatingChange = useCallback(
		(newRating: number) => {
			setRating(newRating);
			if (onChange) {
				onChange(newRating);
			}
		},
		[onChange]
	);

	const handleMouseMove = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
		if (!containerRef.current) return;
		const rect = containerRef.current.getBoundingClientRect();
		const x = event.clientX - rect.left;
		const starWidth = rect.width / 5;
		const hoveredStar = Math.ceil(x / starWidth);
		const isHalfStar = (x % starWidth) / starWidth <= 0.5;
		setHoveredRating(isHalfStar ? hoveredStar - 0.5 : hoveredStar);
	}, []);

	const handleMouseLeave = useCallback(() => {
		setHoveredRating(0);
	}, []);

	const handleClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (!containerRef.current) return;
			const rect = containerRef.current.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const starWidth = rect.width / 5;
			const clickedStar = Math.ceil(x / starWidth);
			const isHalfStar = (x % starWidth) / starWidth <= 0.5;
			const newRating = isHalfStar ? clickedStar - 0.5 : clickedStar;
			handleRatingChange(newRating);
		},
		[handleRatingChange]
	);

	const handleKeyDown = useCallback(
		(event: React.KeyboardEvent<HTMLDivElement>) => {
			if (event.key === 'ArrowLeft') {
				handleRatingChange(Math.max(0.5, rating - 0.5));
			} else if (event.key === 'ArrowRight') {
				handleRatingChange(Math.min(5, rating + 0.5));
			}
		},
		[rating, handleRatingChange]
	);

	return (
		<div className={cn('flex items-center space-x-2', className)}>
			<div
				ref={containerRef}
				className="flex space-x-1 focus:outline-none focus:ring-1 focus:ring-primary-foreground rounded-md p-2 ml-[-0.5rem]"
				role="slider"
				tabIndex={0}
				aria-label="Rating"
				aria-valuemin={0}
				aria-valuemax={5}
				aria-valuenow={rating}
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
				onClick={handleClick}
				onKeyDown={handleKeyDown}>
				{[1, 2, 3, 4, 5].map((star) => (
					<div key={star} className="cursor-pointer">
						<StarIcon filled={Math.min(1, Math.max(0, (hoveredRating || rating) - star + 1))} hovered={star <= Math.ceil(hoveredRating)} />
					</div>
				))}
			</div>
		</div>
	);
}
