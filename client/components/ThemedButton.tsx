import {IconButton} from 'react-native-paper';
import {useAppTheme} from '@/app/_layout';

export const ThemedButton = () => {
	const {isDarkMode, toggleTheme} = useAppTheme();

	return (
		<IconButton
			icon={isDarkMode ? 'moon-waning-crescent' : 'white-balance-sunny'}
			onPress={toggleTheme}
			size={24}
		/>
	);
};
