'use client';

import {
	LoadingContainer,
	MessageText,
	SongSelectorContainer,
	SongHeader,
	BackButton,
} from '@/components/ui/StyledComponents';
import {LoadingSpinner} from '@/components/ui/LoadingSpinner';

export default function Loading() {
	return (
		<SongSelectorContainer>
			<SongHeader>
				<BackButton disabled>← Back to Songs</BackButton>
				<div
					style={{
						height: '2.5rem',
						width: '70%',
						background: '#f5f5f5',
						borderRadius: '8px',
						marginBottom: '2rem',
						animation: 'pulse 1.5s ease-in-out infinite',
					}}
				/>
				<div className="metadata">
					{[...Array(3)].map((_, i) => (
						<div
							key={i}
							style={{
								height: '1.5rem',
								width: `${60 - i * 10}%`,
								background: '#f5f5f5',
								borderRadius: '6px',
								marginBottom: '1rem',
								animation: 'pulse 1.5s ease-in-out infinite',
								animationDelay: `${i * 0.2}s`,
							}}
						/>
					))}
				</div>
			</SongHeader>

			<div style={{padding: '2rem 0'}}>
				{[...Array(4)].map((_, i) => (
					<div
						key={i}
						style={{
							marginBottom: '2rem',
						}}
					>
						{[...Array(Math.floor(Math.random() * 8) + 3)].map((_, j) => (
							<div
								key={j}
								style={{
									display: 'inline-block',
									height: '1.5rem',
									width: `${Math.floor(Math.random() * 80 + 20)}px`,
									background: '#f5f5f5',
									borderRadius: '4px',
									margin: '0 0.5rem 0.5rem 0',
									animation: 'pulse 1.5s ease-in-out infinite',
									animationDelay: `${(i * 8 + j) * 0.1}s`,
								}}
							/>
						))}
					</div>
				))}
			</div>

			<LoadingContainer>
				<LoadingSpinner />
				<MessageText>Loading song...</MessageText>
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
