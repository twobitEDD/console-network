/**
 * 03 · Mounting a module in your app.
 *
 * The host owns the rig chrome and channel state. Your app just decides
 * which module to render, and optionally passes in:
 *   - identity  (Dynamic.xyz adapter, BYO provider, or a static stub)
 *   - chain     (viem / wagmi wrapper, if modules need on-chain access)
 *   - t         (i18n resolver)
 *   - labels    (localized button strings)
 *
 * All optional. The smallest working mount is just `<ConsoleHost module={…}/>`.
 */
import "@twobitedd/console-network/styles.css";
import { ConsoleHost } from "@twobitedd/console-network";
import { fourChannelsDemo } from "./02-four-channels.jsx";

export default function App() {
  return (
    <div style={{ position: "fixed", inset: 0, padding: "1rem", display: "flex" }}>
      <ConsoleHost
        module={fourChannelsDemo}
        // Optional: stub identity for offline mode
        identity={{ isAuthenticated: false, handle: "guest", address: null }}
        // Optional: open side rails by default on wide screens
        initialChannels={{ left: true, right: true, bottom: true }}
        // Optional: pipe strings through your i18n lib
        t={(key, fallback) => fallback ?? key}
      />
    </div>
  );
}

/*
 * Real-world wiring with Dynamic.xyz:
 *
 *   import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
 *   import { identityFromDynamic } from "@twobitedd/console-network";
 *
 *   function Route() {
 *     const dynamic = useDynamicContext();
 *     return <ConsoleHost module={myGame} identity={identityFromDynamic(dynamic)} />;
 *   }
 */
