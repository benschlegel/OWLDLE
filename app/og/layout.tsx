import type React from 'react';

export default function Layout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return <div className="w-ful h-full">{children}</div>;
}
