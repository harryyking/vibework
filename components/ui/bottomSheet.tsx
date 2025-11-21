import React, { forwardRef, useCallback, useImperativeHandle, useMemo } from 'react';
import {
  BottomSheetModal,
  BottomSheetView,
  BottomSheetModalProps,
  BottomSheetBackdropProps,
  SNAP_POINT_TYPE,
} from '@gorhom/bottom-sheet';
import { ViewStyle} from 'react-native';
import { FC } from 'react';

export interface ReusableBottomSheetProps extends Omit<BottomSheetModalProps, 'children'> {
  /**
   * Snap points for the sheet (e.g., ['50%', '90%']). Default: ['50%', '90%']
   */
  snapPoints?: (string | number)[];

  /**
   * Initial index when presented. Default: 0 (first snap point)
   */
  initialIndex?: number;

  /**
   * Function to render custom content. Receives { closeSheet } for easy dismissal.
   * Falls back to children if not provided.
   */
  renderContent?: (props: { closeSheet: () => void }) => React.ReactNode;

  /**
   * Custom backdrop component. Default: Semi-transparent black overlay.
   */
  backdropComponent?: FC<BottomSheetBackdropProps>;

  /**
   * Enable drag-to-close. Default: true
   */
  enableDismissOnClose?: boolean;

  /**
   * Sheet background style. Default: white with rounded top corners.
   */
  backgroundStyle?: ViewStyle;

  /**
   * Handle indicator style (top bar). Default: subtle gray.
   */
  handleIndicatorStyle?: ViewStyle;
}

export interface ReusableBottomSheetRef {
  present: () => void;
  dismiss: () => void;
  snapToIndex: (index: number) => void;
}

const ReusableBottomSheet = forwardRef<ReusableBottomSheetRef, ReusableBottomSheetProps>(
  (
    {
      snapPoints = ['50%', '90%'],
      initialIndex = 0,
      renderContent,
      backdropComponent: BackdropComponent,
      enableDismissOnClose = true,
      backgroundStyle,
      handleIndicatorStyle,
      onChange,
      ...modalProps
    },
    ref
  ) => {
    const bottomSheetModalRef = React.useRef<BottomSheetModal>(null);

    // Expose imperative methods via ref
    useImperativeHandle(
      ref,
      () => ({
        present: () => bottomSheetModalRef.current?.present(),
        dismiss: () => bottomSheetModalRef.current?.dismiss(),
        snapToIndex: (index: number) => bottomSheetModalRef.current?.snapToIndex(index),
      }),
      []
    );

    // Default backdrop if none provided
    const defaultBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetModal.Backdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.5}
        />
      ),
      []
    );

    const Backdrop = useMemo(
      () => BackdropComponent || defaultBackdrop,
      [BackdropComponent, defaultBackdrop]
    );

    // Handle sheet change (e.g., close on dismiss)
    const handleSheetChanges = useCallback(
      (index: number, type: SNAP_POINT_TYPE, position: number) => {
        if (index === -1 && enableDismissOnClose) {
          // Optionally add cleanup logic here
        }
        onChange?.(index, type, position);
      },
      [onChange, enableDismissOnClose]
    );

    // Close function for content
    const closeSheet = useCallback(() => {
      bottomSheetModalRef.current?.dismiss();
    }, []);

    // Render content wrapper
    const renderSheetContent = useCallback(
      () => (
        <BottomSheetView
        className='flex-1 bg-background p-4 rounded-t-2xl'
          style={[
            backgroundStyle,
          ]}
        >
          {renderContent ? renderContent({ closeSheet }) : null}
        </BottomSheetView>
      ),
      [renderContent, closeSheet, backgroundStyle]
    );

    return (
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={initialIndex}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backdropComponent={Backdrop}
        backgroundStyle={backgroundStyle}
        handleIndicatorStyle={handleIndicatorStyle}
        enableDismissOnClose={enableDismissOnClose}
        {...modalProps}
      >
        {renderSheetContent()}
      </BottomSheetModal>
    );
  }
);

ReusableBottomSheet.displayName = 'ReusableBottomSheet';

export default ReusableBottomSheet;