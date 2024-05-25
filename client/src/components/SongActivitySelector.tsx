import {useContext} from 'react';
import {SongContext} from '../context/SongContext';

export interface SongActivity {
	label: string;
	description: string;
}

export const songsActivities: Record<string, SongActivity> = {
	lyrics: {
		label: 'Lyrics',
		description: 'Translate the lyrics to another language',
	},
	complete: {
		label: 'Complete',
		description: '',
	},
	translate: {
		label: 'Translate',
		description: '',
	},
};
const SongActivitySelector: React.FC = () => {
	const {setActivityType} = useContext(SongContext);

	const handleActivityClick = (activity: SongActivity) => {
		setActivityType(activity);
	};

	return (
		<div>
			{Object.entries(songsActivities).map(([key, activity]) => (
				<button key={key} onClick={() => handleActivityClick(activity)}>
					{activity.label}
				</button>
			))}
		</div>
	);
};

export default SongActivitySelector;
