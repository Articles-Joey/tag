

const tagAdjectives = [
    'Speedy', 'Sneaky', 'Quick', 'Agile', 'Elusive', 'Swift', 'Clever', 'Bold',
    'Daring', 'Nimble', 'Stealthy', 'Wily', 'Chaser', 'Runner', 'Taggy', 'Fleet',
    'Zippy', 'Lively', 'Spry', 'Vigilant', 'Alert', 'Eager', 'Energetic', 'Playful',
    'Wild', 'Brave', 'Sly', 'Crafty', 'Dashing', 'Hasty'
];

const tagNouns = [
    'Tagger', 'Runner', 'Seeker', 'Catcher', 'Dodger', 'Sprinter', 'Chaser', 'It',
    'Base', 'SafeZone', 'Player', 'Shadow', 'Ghost', 'Hunter', 'Escapee', 'Pursuer',
    'Scout', 'Hider', 'Bluffer', 'Juker', 'Spinner', 'Leaper', 'Diver', 'Slider',
    'Jumper', 'Ducker', 'Weaver', 'Marker', 'Target', 'Outlaw'
];



/**
 * Generates a random tag-themed nickname.
 * @returns {string} A random nickname like "SpeedyTagger42" or "SneakyRunner7".
 */
const generateRandomNickname = () => {
    const adj = tagAdjectives[Math.floor(Math.random() * tagAdjectives.length)];
    const noun = tagNouns[Math.floor(Math.random() * tagNouns.length)];
    const num = Math.floor(Math.random() * 100);
    return `${adj}${noun}${num}`;
};

export default generateRandomNickname;