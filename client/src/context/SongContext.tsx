import React, {createContext, useState} from 'react';
import {SongContextValue} from './lib/types';
import {SongActivity} from '../components/lib/types';

export const SongContext = createContext<SongContextValue>({
	activityType: null,
	setActivityType: () => {},
});

export const SongProvider: React.FC<{children: React.ReactNode}> = ({
	children,
}) => {
	const [activityType, setActivityType] = useState<SongActivity | null>(null);

	return (
		<SongContext.Provider value={{activityType, setActivityType}}>
			{children}
		</SongContext.Provider>
	);
};
