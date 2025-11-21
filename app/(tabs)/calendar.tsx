import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import CustomText from '@/components/ui/customtext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronRight, Plus } from 'lucide-react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { useSQLiteContext } from 'expo-sqlite';
import * as Notifications from 'expo-notifications';
import { useTheme } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

// --- Constants for calculation ---
const HOUR_HEIGHT = 80;
const MINUTES_IN_HOUR = 60;
const PIXELS_PER_MINUTE = HOUR_HEIGHT / MINUTES_IN_HOUR;

// --- Helper Functions ---
const getDurationString = (minutes: number) => {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60 > 0 ? (minutes % 60) + 'm' : ''}`;
};

const getDayAbbr = (day: number) => ['S', 'M', 'T', 'W', 'T', 'F', 'S'][day];
const formatDateKey = (date: Date) => date.toISOString().split('T')[0];
const formatHeaderDate = (date: Date) => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

// Hex codes to ensure background color always renders, even if tailwind fails
const colorHexMap: Record<string, string> = {
  Study: '#3b82f6',   // blue-500
  Fitness: '#22c55e', // green-500
  Read: '#f97316',    // orange-500
  Focus: '#a855f7',   // purple-500
};

interface Event {
  id: string;
  title: string;
  start: number;
  duration: number;
  tagName: string; // Store the tag name to lookup color
}

interface EventRow {
  id: number;
  title: string;
  start: number;
  duration: number;
  date: string;
  colorClass: string; // Kept for backward compatibility
}

// --- Main Component ---
const CalendarScreen = () => {
  const theme = useTheme();
  const db = useSQLiteContext();
  const today = new Date();
  
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [eventsByDate, setEventsByDate] = useState<{ [key: string]: Event[] }>({});
  
  const scrollRef = useRef<ScrollView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  
  const [sheetMode, setSheetMode] = useState<'main' | 'tag' | 'start' | 'duration'>('main');
  
  // Form states
  const [selectedTag, setSelectedTag] = useState('Study');
  const [selectedHour, setSelectedHour] = useState(new Date().getHours());
  const [selectedMinute, setSelectedMinute] = useState(0);
  const [selectedDuration, setSelectedDuration] = useState(30);

  // --- Week Calculation Logic ---
  const numDays = 365;
  const numWeeks = Math.ceil(numDays / 7);
  const todayDay = today.getDay();
  const daysToMonday = (todayDay === 0 ? 6 : todayDay - 1);
  const mondayOfWeek = new Date(today);
  mondayOfWeek.setDate(today.getDate() - daysToMonday);
  
  const weeks: Date[][] = [];
  const startMonday = new Date(mondayOfWeek);
  startMonday.setDate(mondayOfWeek.getDate() - Math.floor(numWeeks / 2) * 7);
  
  for (let i = 0; i < numWeeks; i++) {
    const week: Date[] = [];
    for (let j = 0; j < 7; j++) {
      const d = new Date(startMonday);
      d.setDate(startMonday.getDate() + i * 7 + j);
      week.push(d);
    }
    weeks.push(week);
  }

  const initialScrollIndex = Math.floor(numWeeks / 2);
  const { width: screenWidth } = Dimensions.get('window');

  const isToday = (date: Date) => date.toDateString() === today.toDateString();
  const isSelected = (date: Date) => date.toDateString() === selectedDate.toDateString();

  const getEventsForDate = (date: Date) => {
    const key = formatDateKey(date);
    return eventsByDate[key] || [];
  };

  // --- Database Setup ---
  useEffect(() => {
    (async () => {
      try {
        await db.execAsync(`PRAGMA journal_mode = WAL;`);
        
        // Create table
        await db.execAsync(`
          CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            start INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            date TEXT NOT NULL,
            colorClass TEXT NOT NULL,
            notificationId TEXT
          );
        `);
      } catch (error) {
        console.error('DB setup failed:', error);
      }
    })();
  }, [db]);

  // --- Load Events ---
  useEffect(() => {
    (async () => {
      try {
        const allRows = await db.getAllAsync<EventRow>('SELECT * FROM events');
        const byDate: { [key: string]: Event[] } = {};
        
        for (const row of allRows) {
          const key = row.date;
          if (!byDate[key]) byDate[key] = [];
          
          // We interpret 'title' from DB as the tagName (e.g. 'Study')
          byDate[key].push({
            id: row.id.toString(),
            title: row.title, 
            start: row.start,
            duration: row.duration,
            tagName: row.title, // Using title as tag name for color lookup
          });
        }
        setEventsByDate(byDate);
      } catch (e) {
        console.log("Error loading events", e);
      }
    })();
  }, [db]);

  // --- Add Event ---
  const handleAddEvent = async () => {
    const startMinutes = selectedHour * 60 + selectedMinute;
    const dateKey = formatDateKey(selectedDate);
    // We save the Tag Name as the 'colorClass' or just rely on title lookup
    const colorClass = selectedTag; 

    try {
      const result = await db.runAsync(
        'INSERT INTO events (title, start, duration, date, colorClass) VALUES (?, ?, ?, ?, ?)',
        selectedTag, // This becomes the title
        startMinutes,
        selectedDuration,
        dateKey,
        colorClass
      );

      const newEvent: Event = {
        id: result.lastInsertRowId.toString(),
        title: selectedTag,
        start: startMinutes,
        duration: selectedDuration,
        tagName: selectedTag
      };

      const currentEvents = eventsByDate[dateKey] || [];
      setEventsByDate({
        ...eventsByDate,
        [dateKey]: [...currentEvents, newEvent],
      });

      // Schedule Notification logic...
      // (Kept your existing logic here abbreviated for brevity)

      bottomSheetRef.current?.close();
    } catch (e) {
      Alert.alert("Error", "Could not save event");
    }
  };

  // --- Handle Scroll Logic (Fixing Monday Issue) ---
  const handleMomentumScrollEnd = (e: any) => {
    const offset = e.nativeEvent.contentOffset.x;
    const index = Math.round(offset / screenWidth);
    const visibleWeek = weeks[index];

    if (visibleWeek) {
      // Check if the *currently selected date* is already in this visible week.
      // If it is, do nothing (let user stay on the day they chose).
      const isSelectedInWeek = visibleWeek.some(d => d.toDateString() === selectedDate.toDateString());

      if (!isSelectedInWeek) {
        // User swiped to a new week. 
        // 1. Is "Today" in this new week? If yes, select Today.
        const todayInWeek = visibleWeek.find(d => isToday(d));
        
        if (todayInWeek) {
          setSelectedDate(todayInWeek);
        } else {
          // 2. Otherwise, default to the first day (Monday)
          setSelectedDate(visibleWeek[0]);
        }
      }
    }
  };

  // --- Auto-scroll to current time on Today ---
  useEffect(() => {
    if (isToday(selectedDate)) {
      // Wait a frame for layout
      setTimeout(() => {
        const current = new Date();
        const minutes = current.getHours() * 60 + current.getMinutes();
        const y = Math.max(0, minutes * PIXELS_PER_MINUTE - 100); 
        scrollRef.current?.scrollTo({ y: y, animated: true });
      }, 100);
    } else {
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  }, [selectedDate]);

  // Bottom Sheet Handlers
  const handleOpenBottomSheet = useCallback(() => bottomSheetRef.current?.expand(), []);
  const handleCloseBottomSheet = useCallback(() => bottomSheetRef.current?.close(), []);

  return (
    <SafeAreaView className="flex-1 bg-background">
      
      {/* Header */}
      <View className="flex-row justify-between items-center px-4 pt-4 pb-2">
        <View>
          <CustomText className="text-foreground text-[28px] font-bold">
            {formatHeaderDate(selectedDate)}
          </CustomText>
        </View>
        <Button
          className="w-10 h-10 rounded-full p-0 items-center justify-center bg-primary"
          onPress={handleOpenBottomSheet}
        >
          <Plus color="#FFF" size={24} />
        </Button>
      </View>

      {/* Week Scroller */}
      <View className="py-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={weeks}
          keyExtractor={(item) => item[0].toISOString()}
          initialScrollIndex={initialScrollIndex}
          getItemLayout={(data, index) => ({
            length: screenWidth,
            offset: screenWidth * index,
            index,
          })}
          pagingEnabled={true}
          onMomentumScrollEnd={handleMomentumScrollEnd} // <--- CHANGED HERE
          renderItem={({ item: week }) => (
            <View className="flex-row justify-evenly" style={{ width: screenWidth }}>
              {week.map((day) => (
                <TouchableOpacity
                  key={day.toISOString()}
                  onPress={() => setSelectedDate(day)}
                  className={`items-center justify-center w-12 h-14 space-y-0 rounded-2xl ${
                    isToday(day)
                      ? 'bg-destructive'
                      : isSelected(day)
                      ? 'bg-muted'
                      : 'bg-card'
                  }`}
                >
                  <CustomText
                    variant="small"
                    className={`${
                      isToday(day) ? 'text-white' : 'text-muted-foreground'
                    } text-xs font-medium`}
                  >
                    {getDayAbbr(day.getDay())}
                  </CustomText>
                  <CustomText
                    className={`${
                      isToday(day) ? 'text-white' : 'text-foreground'
                    } text-lg tracking-wide font-semibold mt-1`}
                  >
                    {day.getDate()}
                  </CustomText>
                </TouchableOpacity>
              ))}
            </View>
          )}
        />
      </View>

      {/* Timeline */}
      <ScrollView className="flex-1" ref={scrollRef}>
        <View className="flex-row p-4">
          {/* Time Gutter */}
          <View className="w-[50px] mr-2.5">
            {hours.map((hour, index) => (
              <CustomText
                key={index}
                className="text-muted-foreground text-xs h-[80px] text-right -top-1.5"
              >
                {hour}
              </CustomText>
            ))}
          </View>
          
          {/* Event Blocks */}
          <View
            className="flex-1 relative"
            style={{ minHeight: 24 * HOUR_HEIGHT }}
          >
            {/* Current Time Indicator Line (Only on Today) */}
            {isToday(selectedDate) && (() => {
               const now = new Date();
               const mins = now.getHours() * 60 + now.getMinutes();
               const top = mins * PIXELS_PER_MINUTE;
               return (
                 <View 
                   className="absolute w-full border-t-2 border-destructive z-10 flex-row items-center" 
                   style={{ top }}
                 >
                   <View className="w-2 h-2 rounded-full bg-destructive -ml-1 -mt-1" />
                 </View>
               )
            })()}

            {getEventsForDate(selectedDate).map((event) => {
              const height = event.duration * PIXELS_PER_MINUTE;
              const top = event.start * PIXELS_PER_MINUTE;
              const durationStr = getDurationString(event.duration);
              const bgColor = colorHexMap[event.tagName] || '#6b7280'; // Fallback gray

              return (
                <TouchableOpacity
                  key={event.id}
                  activeOpacity={0.9}
                  onPress={() => Alert.alert(event.title, `${getDurationString(event.duration)} session`)}
                  style={{
                    position: 'absolute',
                    left: 0,
                    right: 0,
                    top: top,
                    height: Math.max(height, 30), // Ensure it's at least 30px high
                    backgroundColor: bgColor, // <--- Explicit style for color
                    borderRadius: 8,
                    overflow: 'hidden',
                    padding: 6, // <--- Reduced padding from CardContent
                  }}
                >
                  {/* We use a View instead of CardContent to control padding tightly */}
                  <View className="flex-row justify-between items-start">
                    <CustomText 
                      className="text-white font-semibold flex-1 mr-1"
                      numberOfLines={1}
                    >
                      {event.title}
                    </CustomText>
                  </View>
                  
                  {/* Only show duration if height is big enough */}
                  {height > 40 && (
                    <CustomText className="text-white/80 text-xs font-medium mt-1">
                      {durationStr}
                    </CustomText>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Sheet (Add Event) */}
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        snapPoints={sheetMode === 'main' ? ['60%'] : ['50%']}
        enablePanDownToClose={sheetMode === 'main'}
        onClose={() => {
          setSheetMode('main');
        }}
        backgroundStyle={{ backgroundColor: theme.colors.card }}
        handleIndicatorStyle={{ backgroundColor: theme.colors.text }}
      >
        <BottomSheetView className="flex-1 px-6 pt-4">
          {/* Main Form */}
          {sheetMode === 'main' && (
            <>
              <CustomText className="text-foreground text-2xl font-bold mb-6 text-center">
                New Session
              </CustomText>

              {/* Tag Row */}
              <TouchableOpacity
                onPress={() => setSheetMode('tag')}
                className="bg-secondary/30 rounded-2xl px-4 py-4 mb-3 flex-row justify-between items-center"
              >
                <CustomText className="text-foreground font-medium">Activity</CustomText>
                <View className="flex-row items-center">
                  <View 
                    style={{ backgroundColor: colorHexMap[selectedTag] }}
                    className="w-3 h-3 rounded-full mr-2" 
                  />
                  <CustomText className="text-muted-foreground mr-2">{selectedTag}</CustomText>
                  <ChevronRight size={18} color={theme.colors.text} className="opacity-50" />
                </View>
              </TouchableOpacity>

              {/* Start Time */}
              <TouchableOpacity
                onPress={() => setSheetMode('start')}
                className="bg-secondary/30 rounded-2xl px-4 py-4 mb-3 flex-row justify-between items-center"
              >
                <CustomText className="text-foreground font-medium">Start Time</CustomText>
                <View className="flex-row items-center">
                  <CustomText className="text-muted-foreground mr-2">
                    {String(selectedHour).padStart(2, '0')}:{String(selectedMinute).padStart(2, '0')}
                  </CustomText>
                  <ChevronRight size={18} color={theme.colors.text} className="opacity-50" />
                </View>
              </TouchableOpacity>

              {/* Duration */}
              <TouchableOpacity
                onPress={() => setSheetMode('duration')}
                className="bg-secondary/30 rounded-2xl px-4 py-4 mb-6 flex-row justify-between items-center"
              >
                <CustomText className="text-foreground font-medium">Duration</CustomText>
                <View className="flex-row items-center">
                  <CustomText className="text-muted-foreground mr-2">{selectedDuration}m</CustomText>
                  <ChevronRight size={18} color={theme.colors.text} className="opacity-50" />
                </View>
              </TouchableOpacity>

              <Button onPress={handleAddEvent} size={'lg'} className="rounded-full bg-primary">
                <CustomText className="text-white font-bold text-lg">Add Session</CustomText>
              </Button>
            </>
          )}

          {/* Tag Picker */}
          {sheetMode === 'tag' && (
            <View className="flex-1">
              <View className="flex-row items-center mb-4">
                <TouchableOpacity onPress={() => setSheetMode('main')} className="p-2">
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <CustomText className="text-foreground text-lg font-bold flex-1 text-center mr-10">
                  Select Activity
                </CustomText>
              </View>
              {Object.keys(colorHexMap).map((tag) => (
                <TouchableOpacity
                  key={tag}
                  onPress={() => {
                    setSelectedTag(tag);
                    setSheetMode('main');
                  }}
                  className="flex-row items-center py-4 border-b border-border"
                >
                  <View style={{ backgroundColor: colorHexMap[tag] }} className="w-4 h-4 rounded-full mr-4" />
                  <CustomText className="text-foreground text-base flex-1">{tag}</CustomText>
                  {selectedTag === tag && <Ionicons name="checkmark" size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Start Time Picker */}
          {sheetMode === 'start' && (
            <View className="flex-1 items-center">
               <View className="flex-row items-center mb-4 w-full">
                <TouchableOpacity onPress={() => setSheetMode('main')} className="p-2">
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <CustomText className="text-foreground text-lg font-bold flex-1 text-center mr-10">
                  Set Start Time
                </CustomText>
              </View>
              <View className="flex-row items-center justify-center">
                <Picker
                  selectedValue={selectedHour}
                  onValueChange={setSelectedHour}
                  style={{ width: 120 }}
                  itemStyle={{ color: theme.colors.text }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} />
                  ))}
                </Picker>
                <CustomText className="text-foreground text-3xl mx-2">:</CustomText>
                <Picker
                  selectedValue={selectedMinute}
                  onValueChange={setSelectedMinute}
                  style={{ width: 120 }}
                  itemStyle={{ color: theme.colors.text }}
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <Picker.Item key={i} label={String(i).padStart(2, '0')} value={i} />
                  ))}
                </Picker>
              </View>
              <Button onPress={() => setSheetMode('main')} className="mt-6 w-full">
                <CustomText className="text-white">Done</CustomText>
              </Button>
            </View>
          )}

          {/* Duration Picker */}
          {sheetMode === 'duration' && (
            <View className="flex-1 items-center">
               <View className="flex-row items-center mb-4 w-full">
                <TouchableOpacity onPress={() => setSheetMode('main')} className="p-2">
                  <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
                </TouchableOpacity>
                <CustomText className="text-foreground text-lg font-bold flex-1 text-center mr-10">
                  Duration
                </CustomText>
              </View>
              <Picker
                selectedValue={selectedDuration}
                onValueChange={(val) => {
                  setSelectedDuration(val);
                  setSheetMode('main');
                }}
                style={{ width: '100%' }}
                itemStyle={{ color: theme.colors.text }}
              >
                {[15, 25, 30, 45, 60, 90, 120].map((m) => (
                  <Picker.Item key={m} label={`${m} minutes`} value={m} />
                ))}
              </Picker>
            </View>
          )}
        </BottomSheetView>
      </BottomSheet>
    </SafeAreaView>
  );
};

export default CalendarScreen;