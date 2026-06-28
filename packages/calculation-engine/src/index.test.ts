import { describe, expect, it } from 'vitest';
import { calculatePaint, optimizePackages } from './index';

describe('calculatePaint', () => {
  it('calcula una habitación de piso 20 m² sin confundir piso con paredes', () => {
    const result = calculatePaint({
      length: 5,
      width: 4,
      height: 2.5,
      openings: [
        { width: 0.9, height: 2.1 },
        { width: 1.5, height: 1.2 },
      ],
      coats: 2,
      nominalCoverage: 10,
      surfaceFactor: 0.85,
      wastePercent: 10,
    });

    expect(result.floorArea).toBe(20);
    expect(result.grossWallArea).toBe(45);
    expect(result.openingArea).toBe(3.69);
    expect(result.netWallArea).toBe(41.31);
    expect(result.litersRequired).toBe(10.69);
  });

  it('rechaza aberturas superiores al área de pared', () => {
    expect(() => calculatePaint({
      length: 1,
      width: 1,
      height: 1,
      openings: [{ width: 10, height: 10 }],
      coats: 2,
      nominalCoverage: 10,
      surfaceFactor: 1,
      wastePercent: 10,
    })).toThrow();
  });
});

describe('optimizePackages', () => {
  it('selecciona una combinación suficiente y con poco sobrante', () => {
    const result = optimizePackages(10.7, [
      { id: '1L', liters: 1, price: 25, stock: 20 },
      { id: '4L', liters: 4, price: 72, stock: 10 },
      { id: '15L', liters: 15, price: 220, stock: 2 },
    ]);

    expect(result).not.toBeNull();
    expect(result!.totalLiters).toBeGreaterThanOrEqual(10.7);
  });
});
