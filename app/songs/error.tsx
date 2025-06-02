'use client';

import ErrorBoundary from '@/components/ErrorBoundary';

// Next.js error page component
export default function ErrorPage(props: {
	error: Error & {digest?: string};
	reset: () => void;
}) {
	return <ErrorBoundary error={props.error} reset={props.reset} />;
}
