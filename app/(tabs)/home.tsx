import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/ui/customtext';
import { Card, CardContent } from '@/components/ui/card';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { Asset } from 'expo-asset';
import { Preset, usePomodoro } from '@/context/PomodoroContext';
import SessionModal from '@/components/sessionModal';
import { Text } from '@/components/ui/text';

const SessionSelectionScreen = () => {
  const { presets, setSelectedPreset } = usePomodoro();
  const [thumbnails, setThumbnails] = useState<{ [key: string]: string }>({});
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const generateThumbnails = async () => {
      const map: { [key: string]: string } = {};
      for (const preset of presets) {
        if (!preset.isCustom && preset.videoSource) {
          try {
            const asset = Asset.fromModule(preset.videoSource);
            await asset.downloadAsync();
            const { uri } = await VideoThumbnails.getThumbnailAsync(
              asset.localUri || asset.uri,
              {
                time: 5000,
              }
            );
            map[preset.tag] = uri;
          } catch (e) {
            console.warn('Thumbnail error:', e);
          }
        }
      }
      setThumbnails(map);
    };
    generateThumbnails();
  }, [presets]);

  const handlePresetPress = (preset: Preset) => {
    if (preset.isCustom) {
      // Navigate to custom setup later, or open a different modal
      console.log('Custom preset selected, open custom setup modal/screen');
      return;
    }
    setSelectedPreset(preset);
    setModalVisible(true);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView 
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <CustomText variant={"h2"} className="text-foreground mb-6">VibeWork</CustomText>
        
        {presets.map((item) => (
          <TouchableOpacity 
            key={item.tag}
            onPress={() => handlePresetPress(item)} 
            className="mb-4 w-full"
            activeOpacity={0.9}
          >
            {/* Card Container */}
            <Card className={`h-40 p-0 w-full ${item.isCustom ? 'bg-muted' : ''} overflow-hidden rounded-2xl border-0`}>
              <CardContent className="p-0 w-full h-full">
                {item.isCustom ? (
                  <View className="flex-1 justify-center items-center">
                    <Text className="text-foreground text-5xl font-Bangers">Custom</Text>
                  </View>
                ) : (
                  <>
                    {thumbnails[item.tag] && (
                      <Image
                        source={{ uri: thumbnails[item.tag] }}
                        className="w-full h-full absolute"
                        resizeMode="cover"
                      />
                    )}
                    {/* Semi-Transparent Overlay */}
                    <View
                      className="absolute inset-0 flex-1 justify-center items-center bg-black/10"
                    >
                      <Text className="text-5xl text-white font-Bangers italic text-center px-4 shadow-lg">
                        {item.tag}
                      </Text>
                    </View>
                  </>
                )}
              </CardContent>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <SessionModal visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
};

export default SessionSelectionScreen;