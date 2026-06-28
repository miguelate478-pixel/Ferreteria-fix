import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { MixColorsDto } from './dto/mix-colors.dto';

// ─────────────────────────────────────────────
// Helpers para trabajar en espacio OkLab
// (no requiere dependencias externas)
// ─────────────────────────────────────────────

function hexToLinear(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return [toLinear(r), toLinear(g), toLinear(b)];
}

function linearToOklab(r: number, g: number, b: number): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b;
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b;
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b;

  const l_ = Math.cbrt(l);
  const m_ = Math.cbrt(m);
  const s_ = Math.cbrt(s);

  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ];
}

function oklabToLinear(L: number, a: number, b: number): [number, number, number] {
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;

  return [
    +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  ];
}

function linearToHex(r: number, g: number, b: number): string {
  const toSrgb = (c: number): number => {
    const clamped = Math.max(0, Math.min(1, c));
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  };
  const comp = [toSrgb(r), toSrgb(g), toSrgb(b)]
    .map((c) => Math.round(c * 255).toString(16).padStart(2, '0'))
    .join('');
  return `#${comp}`;
}

/** Mezcla colores en espacio OkLab por proporciones relativas */
export function mixColorsOklab(
  parts: Array<{ hex: string; proportion: number }>,
): string {
  const total = parts.reduce((s, p) => s + p.proportion, 0);
  if (total === 0) return '#808080';

  let L = 0, a = 0, b = 0;

  for (const part of parts) {
    const w = part.proportion / total;
    const linear = hexToLinear(part.hex);
    const [lL, la, lb] = linearToOklab(...linear);
    L += w * lL;
    a += w * la;
    b += w * lb;
  }

  const [lr, lg, lbv] = oklabToLinear(L, a, b);
  return linearToHex(lr, lg, lbv);
}

/** Distancia perceptual entre dos hex en OkLab (Delta-E aproximado) */
export function colorDistance(hex1: string, hex2: string): number {
  const [L1, a1, b1] = linearToOklab(...hexToLinear(hex1));
  const [L2, a2, b2] = linearToOklab(...hexToLinear(hex2));
  return Math.sqrt((L1 - L2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

// ─────────────────────────────────────────────
// Service
// ─────────────────────────────────────────────

@Injectable()
export class ColorsService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista todos los colores activos, opcionalmente filtrados por marca o familia */
  listColors(brand?: string, family?: string, search?: string) {
    return this.prisma.color.findMany({
      where: {
        status: 'ACTIVE',
        ...(brand ? { brand } : {}),
        ...(family ? { family } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: {
        formulas: {
          include: {
            productVariant: {
              include: {
                product: { select: { id: true, name: true, brand: true } },
                inventoryBalances: {
                  include: { location: { include: { branch: { select: { id: true, name: true } } } } },
                },
              },
            },
          },
        },
      },
      orderBy: [{ family: 'asc' }, { name: 'asc' }],
    });
  }

  /**
   * Mezcla una lista de colores hex por proporciones y devuelve:
   * - El color resultante en hex
   * - Los colores del catálogo más cercanos (con stock si corresponde)
   */
  async mixColors(dto: MixColorsDto) {
    const resultHex = mixColorsOklab(dto.parts);

    // Buscar los 5 más cercanos en el catálogo
    const allColors = await this.prisma.color.findMany({
      where: {
        status: 'ACTIVE',
        ...(dto.brand ? { brand: dto.brand } : {}),
      },
      include: {
        formulas: {
          include: {
            productVariant: {
              include: {
                product: { select: { id: true, name: true, brand: true } },
                inventoryBalances: {
                  include: { location: { include: { branch: { select: { id: true, name: true } } } } },
                },
              },
            },
          },
        },
      },
    });

    const ranked = allColors
      .map((color) => ({
        ...color,
        distance: colorDistance(resultHex, color.rgbHex),
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 5)
      .map(({ distance, ...color }) => ({
        ...color,
        distance: Math.round(distance * 1000) / 1000,
        inStock: color.formulas.some((f) =>
          f.productVariant.inventoryBalances.some((ib) => Number(ib.available) > 0),
        ),
      }));

    return {
      resultHex,
      parts: dto.parts,
      closestCatalogColors: ranked,
    };
  }

  /** Genera una paleta armónica a partir de un color base */
  generateHarmony(baseHex: string, scheme: 'complementary' | 'analogous' | 'triadic' | 'split') {
    const linear = hexToLinear(baseHex);
    const [L, a, b] = linearToOklab(...linear);

    // Convertir a Oklch para manipular el tono (hue)
    const chroma = Math.sqrt(a * a + b * b);
    const hue = Math.atan2(b, a); // radianes

    const toHex = (h: number) => {
      const na = chroma * Math.cos(h);
      const nb = chroma * Math.sin(h);
      const [lr, lg, lbv] = oklabToLinear(L, na, nb);
      return linearToHex(lr, lg, lbv);
    };

    const deg = (d: number) => (hue + (d * Math.PI) / 180);

    let colors: string[];
    switch (scheme) {
      case 'complementary':
        colors = [baseHex, toHex(deg(180))];
        break;
      case 'analogous':
        colors = [toHex(deg(-30)), baseHex, toHex(deg(30))];
        break;
      case 'triadic':
        colors = [baseHex, toHex(deg(120)), toHex(deg(240))];
        break;
      case 'split':
        colors = [baseHex, toHex(deg(150)), toHex(deg(210))];
        break;
      default:
        colors = [baseHex];
    }

    return { scheme, baseHex, colors };
  }
}
