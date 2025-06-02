'use client';

import {
	ErrorContainer,
	BackButton,
	MessageText,
} from '@/components/ui/StyledComponents';
import {useRouter} from 'next/navigation';

export default function NotFound() {
	const router = useRouter();

	return (
		<ErrorContainer>
			<h2>Song Not Found</h2>
			<MessageText>
				Sorry, the song you&apos;re looking for does not exist or has been
				removed.
			</MessageText>
			<BackButton onClick={() => router.push('/songs')}>
				← Back to Songs
			</BackButton>
		</ErrorContainer>
	);
}
