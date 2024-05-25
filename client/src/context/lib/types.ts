import {SongActivity} from '../../components/SongActivitySelector';

export interface SongContextValue {
	activityType: SongActivity | null;
	setActivityType: (activity: SongActivity | null) => void;
}
