******Drink Tracker******

A lightweight mobile app that helps track drinks during a night out, focusing on fast interaction, low friction logging, and safe actions.

Built as a side project to explore mobile development with React Native (Expo) and TypeScript, with a strong focus on interaction design and UX safety.


******Purpose of the project******

This project is mainly educational and explores:

- Mobile app development using React Native + Expo + TypeScript
- Designing fast, low-friction user interactions
- Building safe state transitions with undoable actions
- Managing temporary vs committed state in real-world UX flows

This project is not about feature completeness, but about exploring how small interaction decisions shape user behavior in real-world mobile contexts.


******Key UX focus******

Instead of treating this as a simple tracker, the project focuses on:

- Preventing accidental destructive actions
- Designing reversible actions using an undo window
- Prioritising one-handed, low-attention interaction patterns
- Clear hierarchy between primary, secondary, and destructive actions


******Core features******

- Log drinks instantly (beer, wine, cocktail, shot)
- Active “session” tracking
- Undo last drink
- End session with undoable confirmation flow
- Session history with basic statistics
- Persistent storage using AsyncStorage


******Session model******

The app introduces a simple session lifecycle:

- Active session → drinks are logged in real time
- End session → moves into a temporary state
- Undo window → allows reversal before final commit
- History → permanently stored sessions
