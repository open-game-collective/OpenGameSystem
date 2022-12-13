import { Routes } from '../routes/routes.container';
import { Canvas } from '@react-three/fiber';
import { FC, ReactElement, Suspense } from 'react';
import { Box } from '@atoms/Box';
import { Sheet, SheetContent } from '@atoms/Sheet';
import { BottomSheet } from 'react-spring-bottom-sheet';
import {
  SnapPointProps,
  defaultSnapProps,
} from 'react-spring-bottom-sheet/dist/types';
import 'react-spring-bottom-sheet/dist/style.css';
import { ColyseusContext } from '../state/colyseus.context';
import { useContextBridge } from '@react-three/drei';

const DEFAULT_SNAP_POINTS = ({ minHeight }: SnapPointProps) => [minHeight];

const DEFAULT_SNAP = ({ snapPoints }: defaultSnapProps) => snapPoints[0];

export const AppComponent = () => {
  return (
    <>
      <BottomSheet
        open={true}
        blocking={false}
        defaultSnap={DEFAULT_SNAP}
        snapPoints={DEFAULT_SNAP_POINTS}
        expandOnContentDrag={true}
      >
        <Routes />
      </BottomSheet>
      <SceneContainer>
        <></>
      </SceneContainer>
    </>
  );
};

interface SceneContainerProps {
  children: ReactElement;
}

const SceneContainer: FC<SceneContainerProps> = ({ children }) => {
  // const state = useSelector(actor, (state) => state);
  const ContextBridge = useContextBridge(ColyseusContext);

  return (
    <Box css={{ background: '$primary1', height: '100vh' }}>
      <Canvas
        gl={{ physicallyCorrectLights: true }}
        camera={{ position: [0, 0, 1] }}
      >
        <color attach="background" args={['#000']} />
        <ContextBridge>
          <Suspense fallback={null}>{children}</Suspense>
        </ContextBridge>
      </Canvas>
    </Box>
  );
};

interface LeftSheetProps {
  children: ReactElement;
}

export const LeftSheet: FC<LeftSheetProps> = ({ children }) => {
  return (
    <Sheet open={false}>
      <SheetContent css={{ background: '$panel1' }} side="left">
        {children}
      </SheetContent>
    </Sheet>
  );
};

interface RightSheetProps {
  children: ReactElement;
}

export const RightSheet: FC<RightSheetProps> = ({ children }) => {
  return (
    <Sheet open={false}>
      <SheetContent css={{ background: '$panel1' }} side="right">
        {children}
      </SheetContent>
    </Sheet>
  );
};

interface TopSheetProps {
  children: ReactElement;
}

export const TopSheet: FC<TopSheetProps> = ({ children }) => {
  return (
    <Sheet open={false}>
      <SheetContent css={{ background: '$panel1' }} side="top">
        {children}
      </SheetContent>
    </Sheet>
  );
};
