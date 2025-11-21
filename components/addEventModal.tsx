// components/AddEventModal.tsx
import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import CustomText from '@/components/ui/customtext';
import { Button } from '@/components/ui/button';
import { PRESET_TAGS, PresetTag } from '@/lib/constants';

interface AddEventModalProps {
  visible: boolean;
  onClose: () => void;
  onAddEvent: (tag: PresetTag, start: number) => void;
  selectedTag: PresetTag;
  eventStart: number;
  setSelectedTag: (tag: PresetTag) => void;
  setEventStart: (start: number) => void;
}

export const AddEventModal: React.FC<AddEventModalProps> = ({
  visible,
  onClose,
  onAddEvent,
  selectedTag,
  eventStart,
  setSelectedTag,
  setEventStart,
}) => {
  if (!visible) return null;

  return (
    <View className="absolute inset-0 bg-black/50 justify-center items-center p-4">
      <View className="bg-card rounded-lg p-4 w-80">
        <CustomText className="text-foreground text-lg font-bold mb-4">Add Event</CustomText>
        
        <View className="mb-4">
          <CustomText className="text-foreground mb-2">Select Tag:</CustomText>
          <View className="flex-row flex-wrap justify-between">
            {Object.entries(PRESET_TAGS).map(([key, { title }]) => (
              <TouchableOpacity
                key={key}
                onPress={() => setSelectedTag(key as PresetTag)}
                className={`px-3 py-1 rounded-md mb-2 ${
                  selectedTag === key ? 'bg-primary' : 'bg-muted'
                }`}
              >
                <CustomText className="text-foreground/80 text-sm">{title}</CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View className="mb-4">
          <CustomText className="text-foreground mb-2">Start Time (minutes from midnight):</CustomText>
          <Button variant="outline" onPress={() => { /* Time picker integration here */ }}>
            <CustomText>{Math.floor(eventStart / 60)}:{(eventStart % 60).toString().padStart(2, '0')}</CustomText>
          </Button>
        </View>

        <View className="flex-row justify-end space-x-2">
          <Button variant="outline" onPress={onClose}>
            <CustomText>Cancel</CustomText>
          </Button>
          <Button onPress={() => onAddEvent(selectedTag, eventStart)}>
            <CustomText>Add</CustomText>
          </Button>
        </View>
      </View>
    </View>
  );
};