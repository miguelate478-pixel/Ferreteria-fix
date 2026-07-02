/**
 * Vocabulario de colores en lenguaje natural (español).
 * Cada entrada mapea palabras clave → color de referencia en hex.
 * Se usa para interpretar búsquedas como "verde menta suave" o "azul cielo".
 */

export interface VocabEntry {
  keywords: string[];
  hex: string;
  family: string;
  description: string;
}

export const COLOR_VOCABULARY: VocabEntry[] = [
  // ── blancos y cremas ──────────────────────────────────────────────────────
  { keywords: ['blanco', 'white', 'nieve', 'snow', 'puro'], hex: '#FFFFFF', family: 'WHITE', description: 'blanco puro' },
  { keywords: ['crema', 'cream', 'marfil', 'ivory', 'hueso', 'bone'], hex: '#FFF8E7', family: 'WHITE', description: 'blanco crema' },
  { keywords: ['blanco roto', 'off white', 'calido', 'cálido'], hex: '#F5F0E8', family: 'WHITE', description: 'blanco roto cálido' },

  // ── grises ────────────────────────────────────────────────────────────────
  { keywords: ['gris', 'gray', 'grey', 'plata', 'silver'], hex: '#9E9E9E', family: 'GRAY', description: 'gris medio' },
  { keywords: ['gris claro', 'gris suave', 'gris pálido'], hex: '#D4D4D4', family: 'GRAY', description: 'gris claro' },
  { keywords: ['gris oscuro', 'gris profundo', 'gris carbón', 'carbon'], hex: '#5A5A5A', family: 'GRAY', description: 'gris oscuro' },
  { keywords: ['gris cálido', 'greige', 'gris beige', 'gris arena'], hex: '#B8B0A0', family: 'GRAY', description: 'gris cálido' },
  { keywords: ['gris frío', 'gris azulado', 'gris pizarra', 'slate'], hex: '#8A9099', family: 'GRAY', description: 'gris frío' },

  // ── negros ────────────────────────────────────────────────────────────────
  { keywords: ['negro', 'black', 'oscuro', 'dark', 'profundo'], hex: '#1A1A1A', family: 'BLACK', description: 'negro' },
  { keywords: ['negro suave', 'negro cálido', 'casi negro'], hex: '#2C2820', family: 'BLACK', description: 'negro cálido' },

  // ── beiges y neutros cálidos ──────────────────────────────────────────────
  { keywords: ['beige', 'arena', 'sand', 'tostado', 'tan'], hex: '#C8B89A', family: 'BEIGE', description: 'beige arena' },
  { keywords: ['beige claro', 'beige suave', 'lino', 'linen'], hex: '#E8DCCA', family: 'BEIGE', description: 'beige claro' },
  { keywords: ['nude', 'desnudo', 'piel', 'skin', 'natural'], hex: '#D4B896', family: 'BEIGE', description: 'nude natural' },
  { keywords: ['taupe', 'gris beige', 'gris topo'], hex: '#A89880', family: 'BEIGE', description: 'taupe' },
  { keywords: ['camel', 'camello', 'canela', 'cinnamon'], hex: '#C19A6B', family: 'BROWN', description: 'camel cálido' },

  // ── marrones ──────────────────────────────────────────────────────────────
  { keywords: ['marrón', 'marron', 'café', 'brown', 'chocolate'], hex: '#7B4F2E', family: 'BROWN', description: 'marrón café' },
  { keywords: ['marrón claro', 'café con leche', 'latte', 'cappuccino'], hex: '#A67B5B', family: 'BROWN', description: 'marrón claro' },
  { keywords: ['terracota', 'terra', 'arcilla', 'clay', 'barro'], hex: '#C2714F', family: 'BROWN', description: 'terracota' },
  { keywords: ['cobre', 'copper', 'bronce', 'bronze'], hex: '#B87333', family: 'BROWN', description: 'cobre' },
  { keywords: ['siena', 'sienna', 'ocre', 'ocher', 'ocre'], hex: '#D4904A', family: 'ORANGE', description: 'siena ocre' },

  // ── rojos ─────────────────────────────────────────────────────────────────
  { keywords: ['rojo', 'red', 'bermellón', 'vermilion'], hex: '#CC2200', family: 'RED', description: 'rojo vivo' },
  { keywords: ['rojo suave', 'rojo cálido', 'rojo tierra'], hex: '#B44040', family: 'RED', description: 'rojo suave' },
  { keywords: ['rojo oscuro', 'burdeos', 'borgoña', 'burgundy', 'vino', 'wine'], hex: '#722F37', family: 'RED', description: 'borgoña' },
  { keywords: ['rosa', 'pink', 'rosado', 'palo de rosa', 'blush'], hex: '#E8A0A0', family: 'RED', description: 'rosa suave' },
  { keywords: ['rosa fuerte', 'magenta', 'fucsia', 'fuchsia'], hex: '#CC4488', family: 'RED', description: 'magenta' },
  { keywords: ['salmón', 'salmon', 'coral'], hex: '#FA8072', family: 'ORANGE', description: 'salmón coral' },

  // ── naranjas ──────────────────────────────────────────────────────────────
  { keywords: ['naranja', 'orange', 'mandarina', 'tangerine'], hex: '#E87020', family: 'ORANGE', description: 'naranja vivo' },
  { keywords: ['naranja suave', 'durazno', 'peach', 'melocotón'], hex: '#FFCBA4', family: 'ORANGE', description: 'durazno suave' },
  { keywords: ['naranja oscuro', 'naranja quemado', 'burnt orange'], hex: '#BF5700', family: 'ORANGE', description: 'naranja quemado' },

  // ── amarillos ─────────────────────────────────────────────────────────────
  { keywords: ['amarillo', 'yellow', 'dorado', 'golden', 'sol', 'sun'], hex: '#F5C518', family: 'YELLOW', description: 'amarillo dorado' },
  { keywords: ['amarillo claro', 'limón', 'lemon', 'citrus', 'citrico'], hex: '#F8F058', family: 'YELLOW', description: 'amarillo limón' },
  { keywords: ['amarillo suave', 'mantequilla', 'butter', 'champagne', 'vainilla', 'vanilla'], hex: '#F5E6A3', family: 'YELLOW', description: 'amarillo vainilla' },
  { keywords: ['mostaza', 'mustard', 'curry', 'ocre amarillo'], hex: '#C8A800', family: 'YELLOW', description: 'mostaza' },

  // ── verdes ────────────────────────────────────────────────────────────────
  { keywords: ['verde', 'green', 'esmeralda', 'emerald'], hex: '#2E7D32', family: 'GREEN', description: 'verde medio' },
  { keywords: ['verde claro', 'verde suave', 'verde lima', 'lima', 'lime'], hex: '#8BC34A', family: 'GREEN', description: 'verde lima' },
  { keywords: ['verde menta', 'menta', 'mint', 'verde menta suave'], hex: '#AAD9B8', family: 'GREEN', description: 'verde menta' },
  { keywords: ['verde pastel', 'verde pálido', 'verde agua', 'agua'], hex: '#C8E6C9', family: 'GREEN', description: 'verde pastel' },
  { keywords: ['verde oliva', 'oliva', 'olive', 'verde militar'], hex: '#6B7C4A', family: 'GREEN', description: 'verde oliva' },
  { keywords: ['verde musgo', 'musgo', 'moss', 'verde tierra'], hex: '#4A6741', family: 'GREEN', description: 'verde musgo' },
  { keywords: ['verde oscuro', 'verde bosque', 'forest', 'verde botella'], hex: '#1B5E20', family: 'GREEN', description: 'verde bosque' },
  { keywords: ['verde salvia', 'salvia', 'sage'], hex: '#87A878', family: 'GREEN', description: 'verde salvia' },
  { keywords: ['verde manzana', 'apple', 'verde fresco'], hex: '#6DB33F', family: 'GREEN', description: 'verde manzana' },
  { keywords: ['verde jade', 'jade', 'verde esmeralda oscuro'], hex: '#00A878', family: 'GREEN', description: 'verde jade' },

  // ── azules y turquesas ────────────────────────────────────────────────────
  { keywords: ['azul', 'blue', 'índigo', 'cobalt', 'cobalto'], hex: '#1565C0', family: 'BLUE', description: 'azul medio' },
  { keywords: ['azul claro', 'azul cielo', 'sky', 'celeste'], hex: '#87CEEB', family: 'BLUE', description: 'azul cielo' },
  { keywords: ['azul suave', 'azul pálido', 'azul bebé', 'baby blue'], hex: '#B3CCDD', family: 'BLUE', description: 'azul suave' },
  { keywords: ['azul marino', 'navy', 'marine', 'azul profundo', 'azul oscuro'], hex: '#0D2B5E', family: 'BLUE', description: 'azul marino' },
  { keywords: ['azul pizarra', 'slate blue', 'gris azul', 'azul gris'], hex: '#607D8B', family: 'BLUE', description: 'azul pizarra' },
  { keywords: ['azul petróleo', 'petróleo', 'petroleo', 'teal', 'azul verde oscuro'], hex: '#008080', family: 'BLUE', description: 'azul petróleo' },
  { keywords: ['turquesa', 'turquoise', 'aqua', 'aguamarina'], hex: '#00BCD4', family: 'BLUE', description: 'turquesa' },
  { keywords: ['azul turquesa suave', 'turquesa pastel', 'cyan pastel'], hex: '#B2EBF2', family: 'BLUE', description: 'turquesa suave' },

  // ── violetas y morados ────────────────────────────────────────────────────
  { keywords: ['violeta', 'violet', 'morado', 'purple', 'lavanda', 'lavender'], hex: '#9C5FBC', family: 'PURPLE', description: 'violeta medio' },
  { keywords: ['lila', 'lilac', 'malva', 'mauve', 'lavanda suave'], hex: '#D4A8D4', family: 'PURPLE', description: 'lila suave' },
  { keywords: ['morado oscuro', 'ciruela', 'plum', 'berenjena', 'eggplant'], hex: '#6A1B9A', family: 'PURPLE', description: 'ciruela profundo' },

  // ── modificadores de tono (se usan combinados) ────────────────────────────
  // Estos no se buscan solos; el algoritmo los combina con el color base.
];

/**
 * Interpreta una consulta en lenguaje natural y devuelve el hex de referencia
 * más relevante, junto con modificadores de claridad/saturación detectados.
 */
export interface InterpretedQuery {
  referenceHex: string;
  description: string;
  lightnessShift: number;   // -1 = más oscuro, 0 = neutro, +1 = más claro
  chromaShift: number;      // -1 = más gris/suave, 0 = neutro, +1 = más saturado
  confidence: number;       // 0-1
  matchedKeywords: string[];
}

const LIGHTNESS_MODIFIERS: Array<{ words: string[]; shift: number }> = [
  { words: ['claro', 'clara', 'suave', 'pálido', 'pálida', 'pastel', 'light', 'pale', 'soft'], shift: +1 },
  { words: ['oscuro', 'oscura', 'profundo', 'profunda', 'deep', 'dark'], shift: -1 },
  { words: ['medio', 'media', 'normal', 'estándar', 'mid'], shift: 0 },
];

const SATURATION_MODIFIERS: Array<{ words: string[]; shift: number }> = [
  { words: ['apagado', 'apagada', 'grisáceo', 'grisácea', 'desaturado', 'muted', 'dusty', 'opaco', 'opaca'], shift: -1 },
  { words: ['vibrante', 'saturado', 'vivo', 'viva', 'intenso', 'intensa', 'bold', 'bright'], shift: +1 },
];

export function interpretColorQuery(query: string): InterpretedQuery | null {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  let bestEntry: VocabEntry | null = null;
  let bestScore = 0;
  const matchedKeywords: string[] = [];

  for (const entry of COLOR_VOCABULARY) {
    for (const keyword of entry.keywords) {
      const kw = keyword.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(kw)) {
        const score = kw.length; // longer match = more specific
        if (score > bestScore) {
          bestScore = score;
          bestEntry = entry;
          matchedKeywords.push(keyword);
        }
      }
    }
  }

  if (!bestEntry) return null;

  let lightnessShift = 0;
  let chromaShift = 0;

  for (const mod of LIGHTNESS_MODIFIERS) {
    for (const word of mod.words) {
      const w = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(w)) { lightnessShift = mod.shift; break; }
    }
  }

  for (const mod of SATURATION_MODIFIERS) {
    for (const word of mod.words) {
      const w = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (q.includes(w)) { chromaShift = mod.shift; break; }
    }
  }

  const confidence = Math.min(1, bestScore / 8);

  return {
    referenceHex: bestEntry.hex,
    description: bestEntry.description,
    lightnessShift,
    chromaShift,
    confidence,
    matchedKeywords,
  };
}
