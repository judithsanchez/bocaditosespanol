'use client';

import {ErrorContainer, BackButton} from './ui/StyledComponents';
import {useRouter} from 'next/navigation';

interface Props {
	error: Error & {digest?: string};
	reset: () => void;
}

export default function ErrorBoundary({error, reset}: Props) {
	const router = useRouter();

	return (
		<ErrorContainer>
			<h2>Something went wrong</h2>
			<p>{error.message || 'An unexpected error occurred'}</p>
			<div style={{display: 'flex', gap: '1rem', marginTop: '1rem'}}>
				<BackButton onClick={reset}>Try again</BackButton>
				<BackButton onClick={() => router.push('/')}>Go to Home</BackButton>
			</div>
			{error.digest && (
				<p style={{marginTop: '1rem', fontSize: '0.8rem', color: '#666'}}>
					Error ID: {error.digest}
				</p>
			)}
		</ErrorContainer>
	);
}
