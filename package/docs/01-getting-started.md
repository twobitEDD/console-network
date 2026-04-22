# Getting started

You'll publish a **module** and mount it inside a **host**. That's the whole mental model.

## 1. Write the module

```jsx
// my-game.jsx
import { useState } from "react";
import { defineGameModule, ConsoleSlots } from "@twobitedd/console-network";

function MyGame({ api }) {
  const [score, setScore] = useState(0);

  return (
    <>
      <ConsoleSlots.Viewport>
        <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
          <button type="button" onClick={() => setScore((s) => s + 1)}>
            tap
          </button>
        </div>
      </ConsoleSlots.Viewport>

      <ConsoleSlots.Bottom>
        <p>score: {score} · {api.identity.handle ?? "guest"}</p>
      </ConsoleSlots.Bottom>
    </>
  );
}

export const myGame = defineGameModule({
  id: "tap-tap",
  title: "Tap Tap",
  version: "0.1.0",
  Component: MyGame,
});
```

## 2. Mount it in your app

```jsx
// App.jsx
import { ConsoleHost } from "@twobitedd/console-network";
import "@twobitedd/console-network/styles.css";
import { myGame } from "./my-game";

export default function App() {
  return (
    <div style={{ height: "100dvh", padding: "1rem" }}>
      <ConsoleHost module={myGame} />
    </div>
  );
}
```

That's it. You now have the full salvage-rig around your component, with the bottom HUD open by default and α / β / MODAL channels available to expand.

## 3. Add identity (optional)

Wire Dynamic.xyz in five lines:

```jsx
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { ConsoleHost, identityFromDynamic } from "@twobitedd/console-network";

function Route() {
  const dynamic = useDynamicContext();
  return <ConsoleHost module={myGame} identity={identityFromDynamic(dynamic)} />;
}
```

Your module now reads `api.identity.isAuthenticated`, `api.identity.address`, and `api.identity.handle` without caring which provider is behind it.

## 4. Trigger the center MODAL on game over

The MODAL channel is for pre-game / post-game / prompts. From inside your component:

```jsx
useEffect(() => {
  if (gameOver) api.channels.setCenter(true);
}, [gameOver, api]);
```

And render it conditionally:

```jsx
{gameOver && (
  <ConsoleSlots.Center>
    <OutcomePanel onPlayAgain={() => {
      reset();
      api.channels.setCenter(false);
    }} />
  </ConsoleSlots.Center>
)}
```

## Next

- Learn the full module shape → [Game modules](./02-game-module.md)
- Understand when to use each channel → [Channels](./03-channels.md)
- Re-skin the rig → [Theming](./04-theming.md)
