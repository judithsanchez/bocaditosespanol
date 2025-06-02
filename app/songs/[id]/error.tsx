'use client';

import ErrorState from '@/components/ErrorState';
import {SelectedSongContainer} from '@/components/ui/StyledComponents';
import {useEffect} from 'react';

export default function SongError({
	error,
	reset,
}: {
	error: Error & {digest?: string};
	reset: () => void;
}) {
	useEffect(() => {
		// Log the error to an error reporting service
		console.error('Song Error:', error);
	}, [error]);

	return (
		<SelectedSongContainer>
			<ErrorState
				title="Something went wrong"
				description="We encountered an error while loading the song"
			/>
		</SelectedSongContainer>
	);
}
