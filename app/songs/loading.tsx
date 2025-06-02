'use client';

import {
	LoadingContainer,
	MessageText,
	SongSelectorContainer,
	SearchInput,
	SongListContainer,
} from '@/components/ui/StyledComponents';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';

export default function Loading() {
	return (
		<SongSelectorContainer>
			<SearchInput
				type="text"
				placeholder="Search by title or interpreter..."
				disabled={true}
			/>
			<SongListContainer>
				{[...Array(5)].map((_, i) => (
					<div
						key={i}
						style={{
							height: '4rem',
							background: '#f5f5f5',
							borderRadius: '8px',
							animation: 'pulse 1.5s ease-in-out infinite',
						}}
					/>
				))}
			</SongListContainer>
			<LoadingContainer>
				<LoadingSpinner />
				<MessageText>Loading songs...</MessageText>
			</LoadingContainer>

			<style jsx>{`
				@keyframes pulse {
					0% {
						opacity: 1;
					}
					50% {
						opacity: 0.5;
					}
					100% {
						opacity: 1;
					}
				}
			`}</style>
		</SongSelectorContainer>
	);
}
