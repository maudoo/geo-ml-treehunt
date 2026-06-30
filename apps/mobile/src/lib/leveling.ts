// Level math lives server-side (backend is the source of truth for the XP curve).
// This file only maps a level number to its bundled avatar image — that's a build-time
// asset concern, not game logic, so it has no reason to be a network round-trip.
export const LEVEL_AVATARS: Record<number, any> = {
  1: require('../../assets/images/avatars/Alphahawk_Level1.png'),
  2: require('../../assets/images/avatars/Alphahawk_Level2.png'),
  3: require('../../assets/images/avatars/Alphahawk_Level3.png'),
  4: require('../../assets/images/avatars/Alphahawk_Level4.png'),
  5: require('../../assets/images/avatars/Alphahawk_Level5.png'),
  6: require('../../assets/images/avatars/Alphahawk_Level6.png'),
  7: require('../../assets/images/avatars/Alphahawk_Level7.png'),
  8: require('../../assets/images/avatars/Alphahawk_Level8.png'),
};
