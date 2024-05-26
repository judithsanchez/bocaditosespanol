import {useContext} from 'react';
import {SongContext} from '../context/SongContext';
import {songsActivities} from './lib/constants';
import {SongActivity} from './lib/types';

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
