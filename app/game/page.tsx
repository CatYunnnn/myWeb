import { GameContainer } from '../components/Game/GameContainer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mini Game Space | Portfolio',
  description: 'A dedicated area for interactive experiments.',
};

export default function GamePage() {
  return <GameContainer />;
}
