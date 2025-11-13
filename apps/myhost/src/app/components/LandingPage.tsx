import { Button, Card, CardContent } from '@wiowa-tech-studio/ui';
import React from 'react';
const Mymemory = React.lazy(() => import('mymemory/Module'));
const Mymotus = React.lazy(() => import('mymotus/Module'));

enum Game {
  MOTUS = 'Motus',
  MEMORY = 'Memory',
}

const gameMapping: Record<
  Game,
  React.LazyExoticComponent<() => React.ReactElement>
> = {
  [Game.MOTUS]: Mymotus,
  [Game.MEMORY]: Mymemory,
};

export function LandingPage() {
  const [game, setGame] = React.useState<Game | ''>('');
  const SelectedGameComponent = game ? gameMapping[game] : () => null;
  return (
    <div className="min-h-screen bg-primary/5">
      {/* Hero Section */}
      {game ? (
        <Button>
          <span onClick={() => setGame('')}>Back to Home</span>
        </Button>
      ) : (
        <section className="container mx-auto px-6 py-20">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-primary">Wiowa Tech Studio</span>
            </h1>
            <p className="text-xl md:text-2xl text-secondary-foreground mb-8 max-w-3xl mx-auto">
              Building innovative solutions with cutting-edge technology. We
              create powerful MFE applications that scale.
            </p>
          </div>
        </section>
      )}

      {/* Games Section */}
      {!game && (
        <section className="container mx-auto px-6 py-10 flex justify-center">
          <Card
            className="p-6 cursor-pointer"
            onClick={() => setGame(Game.MOTUS)}
          >
            <CardContent>
              <h3 className="text-2xl font-semibold mb-4">Motus</h3>
            </CardContent>
          </Card>
          <Card
            className="p-6 ml-6 cursor-pointer"
            onClick={() => setGame(Game.MEMORY)}
          >
            <CardContent>
              <h3 className="text-2xl font-semibold mb-4">Memory</h3>
            </CardContent>
          </Card>
        </section>
      )}

      {SelectedGameComponent && (
        <section>
          <SelectedGameComponent />
        </section>
      )}
    </div>
  );
}

export default LandingPage;
