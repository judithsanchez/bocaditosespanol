import React, {createContext, useContext, useState, ReactNode} from 'react';
import {errors, themes} from './lib/constants';
import {ActivityType, AppContextValue, Theme} from './lib/types';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppContextProvider: React.FC<{children: ReactNode}> = ({
	children,
}) => {
	/* Select theme */
	const [theme, setTheme] = useState<Theme>(themes.light);

	/**
	 * Toggles the theme between light and dark.
	 */
	const toggleTheme = () => {
		setTheme(prevTheme =>
			prevTheme === themes.light ? themes.dark : themes.light,
		);
	};

	/* Select activity type */
	const [activityType, setActivityType] = useState<ActivityType>(
		ActivityType.Transcription,
	);

	/* Select content by id */
	const [selectedContentId, setSelectedContentId] = useState<string | null>(
		null,
	);

	const contextValue: AppContextValue = {
		theme,
		toggleTheme,
		activityType,
		setActivityType,
		selectedContentId,
		setSelectedContentId,
	};

	return (
		<AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
	);
};

export const useAppContext = () => {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error(errors.useAppContext);
	}
	return context;
};
