'use client';

import {
	HomeContainer,
	LearnImage,
	Tagline,
	Title,
} from '@/components/ui/StyledComponents';

export default function Home() {
	return (
		<HomeContainer>
			<Tagline>Learn Spanish in Small Bites!</Tagline>

			<LearnImage
				src="https://cdn.bfldr.com/Z0BJ31FP/at/cpgkv47qntn72pg46kpwvb6h/icon-listening.svg"
				alt="Learn Spanish in Small Bites"
			/>
			<Title>Bocaditos de Español</Title>
		</HomeContainer>
	);
}
