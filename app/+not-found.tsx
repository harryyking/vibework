import { Link, Stack } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import CustomText from '@/components/ui/customtext';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
        <CustomText>This screen doesn't exist.</CustomText>

        <Link href="/">
          <CustomText>Go to home screen!</CustomText>
        </Link>
      </View>
    </>
  );
}
