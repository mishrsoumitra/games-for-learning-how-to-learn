/**
 * Swahili–English pairs for the memory activities. Karpicke and Roediger (2008) used Swahili
 * because almost no student knows it, so there is no head start on some pairs and not others.
 * Words were chosen to avoid the ones Indian students might guess: Arabic loan words shared
 * with Hindi and Urdu (kitabu, meza, chai, sukari, kalamu, pesa, dawa, hawa, amani, askari),
 * and words made famous by films (simba, rafiki, hakuna matata, safari).
 *
 * `accept` lists the English forms that count as right. Spelling is forgiven by the marker
 * (one letter off on words of five or more letters), meaning is not.
 */
export interface WordPair {
  id: string;
  cue: string;
  answer: string;
  accept: readonly string[];
}

function pair(cue: string, answer: string, ...more: string[]): WordPair {
  return { id: cue, cue, answer, accept: [answer, ...more] };
}

/** 40 pairs for Reread or recall. */
export const RETRIEVAL_SET: readonly WordPair[] = [
  pair('mashua', 'boat'),
  pair('nyumba', 'house', 'home'),
  pair('maji', 'water'),
  pair('moto', 'fire'),
  pair('jua', 'sun'),
  pair('mwezi', 'moon', 'month'),
  pair('nyota', 'star'),
  pair('mlima', 'mountain', 'hill'),
  pair('mto', 'river'),
  pair('msitu', 'forest', 'jungle', 'woods'),
  pair('mti', 'tree'),
  pair('ndege', 'bird'),
  pair('samaki', 'fish'),
  pair('mbwa', 'dog'),
  pair('paka', 'cat'),
  pair('kuku', 'chicken', 'hen'),
  pair('tembo', 'elephant'),
  pair('twiga', 'giraffe'),
  pair('kiti', 'chair', 'seat'),
  pair('mlango', 'door', 'gate'),
  pair('dirisha', 'window'),
  pair('chakula', 'food', 'meal'),
  pair('mkate', 'bread'),
  pair('maziwa', 'milk'),
  pair('chumvi', 'salt'),
  pair('mtoto', 'child', 'kid', 'baby'),
  pair('usiku', 'night'),
  pair('mvua', 'rain'),
  pair('upepo', 'wind'),
  pair('jiwe', 'stone', 'rock'),
  pair('kisu', 'knife'),
  pair('kikombe', 'cup', 'mug'),
  pair('mkono', 'hand', 'arm'),
  pair('jicho', 'eye'),
  pair('sikio', 'ear'),
  pair('kichwa', 'head'),
  pair('moyo', 'heart'),
  pair('damu', 'blood'),
  pair('mfalme', 'king'),
  pair('wimbo', 'song'),
];

/** 8 extra pairs for the optional test taken five minutes after study. */
export const RETRIEVAL_IMMEDIATE_SET: readonly WordPair[] = [
  pair('furaha', 'joy', 'happiness'),
  pair('ndoto', 'dream'),
  pair('zawadi', 'gift', 'present'),
  pair('kisiwa', 'island'),
  pair('ziwa', 'lake'),
  pair('nyoka', 'snake'),
  pair('kipepeo', 'butterfly'),
  pair('ufunguo', 'key'),
];

/** 20 pairs studied on four days (spaced). */
export const SPACED_SET: readonly WordPair[] = [
  pair('kijiji', 'village'),
  pair('njia', 'path', 'road', 'way'),
  pair('kisima', 'well'),
  pair('jangwa', 'desert'),
  pair('mbegu', 'seed'),
  pair('jani', 'leaf'),
  pair('nyasi', 'grass'),
  pair('chui', 'leopard'),
  pair('fisi', 'hyena'),
  pair('kobe', 'tortoise', 'turtle'),
  pair('nyuki', 'bee'),
  pair('mbu', 'mosquito'),
  pair('sungura', 'rabbit', 'hare'),
  pair('mbuzi', 'goat'),
  pair('kondoo', 'sheep'),
  pair('punda', 'donkey'),
  pair('ngamia', 'camel'),
  pair('yai', 'egg'),
  pair('nyama', 'meat'),
  pair('ndizi', 'banana'),
];

/** 20 pairs studied four times in one sitting (crammed). */
export const CRAMMED_SET: readonly WordPair[] = [
  pair('embe', 'mango'),
  pair('chungwa', 'orange'),
  pair('viazi', 'potatoes', 'potato'),
  pair('mchele', 'rice'),
  pair('kijiko', 'spoon'),
  pair('sufuria', 'pot', 'cooking pot', 'pan'),
  pair('kitanda', 'bed'),
  pair('taa', 'lamp', 'light'),
  pair('mwavuli', 'umbrella'),
  pair('mvulana', 'boy'),
  pair('msichana', 'girl'),
  pair('mgeni', 'guest', 'visitor', 'stranger'),
  pair('jirani', 'neighbour', 'neighbor'),
  pair('mwizi', 'thief', 'robber'),
  pair('mvuvi', 'fisherman', 'fisher'),
  pair('mkulima', 'farmer'),
  pair('mpishi', 'cook', 'chef'),
  pair('mkanda', 'belt'),
  pair('pete', 'ring'),
  pair('kioo', 'mirror', 'glass'),
];

/** 20 pairs for the forgetting curve, tested in fifths over a week. */
export const CURVE_SET: readonly WordPair[] = [
  pair('sauti', 'voice', 'sound'),
  pair('jina', 'name'),
  pair('neno', 'word'),
  pair('kitambaa', 'cloth', 'fabric'),
  pair('kicheko', 'laughter', 'laugh'),
  pair('machozi', 'tears'),
  pair('usingizi', 'sleep'),
  pair('njaa', 'hunger'),
  pair('kiu', 'thirst'),
  pair('baridi', 'cold'),
  pair('joto', 'heat', 'warmth'),
  pair('giza', 'darkness', 'dark'),
  pair('mwanga', 'light'),
  pair('kivuli', 'shadow', 'shade'),
  pair('wingu', 'cloud'),
  pair('radi', 'thunder'),
  pair('mshale', 'arrow'),
  pair('ngao', 'shield'),
  pair('upanga', 'sword'),
  pair('bendera', 'flag'),
];

export const ALL_PAIRS: readonly WordPair[] = [
  ...RETRIEVAL_SET,
  ...RETRIEVAL_IMMEDIATE_SET,
  ...SPACED_SET,
  ...CRAMMED_SET,
  ...CURVE_SET,
];

export function pairById(id: string): WordPair | undefined {
  return ALL_PAIRS.find((p) => p.id === id);
}
