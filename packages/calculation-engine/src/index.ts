export type OpeningInput = {
  width: number;
  height: number;
  quantity?: number;
};

export type PackageOption = {
  id: string;
  liters: number;
  price: number;
  stock?: number;
};

export type PaintCalculationInput = {
  length: number;
  width: number;
  height: number;
  openings?: OpeningInput[];
  excludedArea?: number;
  coats: number;
  nominalCoverage: number;
  surfaceFactor: number;
  applicationFactor?: number;
  wastePercent: number;
  includeCeiling?: boolean;
};

export type PackageSolution = {
  packages: Array<PackageOption & { quantity: number }>;
  totalLiters: number;
  totalPrice: number;
  leftoverLiters: number;
};

export type PaintCalculationResult = {
  floorArea: number;
  grossWallArea: number;
  openingArea: number;
  netWallArea: number;
  ceilingArea: number;
  totalPaintableArea: number;
  effectiveCoverage: number;
  litersBeforeWaste: number;
  litersRequired: number;
};

const round = (value: number, decimals = 2): number => {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

const assertPositive = (name: string, value: number): void => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`${name} debe ser mayor que cero`);
  }
};

export function calculatePaint(input: PaintCalculationInput): PaintCalculationResult {
  assertPositive('Largo', input.length);
  assertPositive('Ancho', input.width);
  assertPositive('Altura', input.height);
  assertPositive('Número de manos', input.coats);
  assertPositive('Rendimiento nominal', input.nominalCoverage);
  assertPositive('Factor de superficie', input.surfaceFactor);

  const applicationFactor = input.applicationFactor ?? 1;
  assertPositive('Factor de aplicación', applicationFactor);

  if (input.wastePercent < 0 || input.wastePercent > 50) {
    throw new Error('El desperdicio debe estar entre 0 % y 50 %');
  }

  const floorArea = input.length * input.width;
  const grossWallArea = 2 * (input.length + input.width) * input.height;
  const openingArea = (input.openings ?? []).reduce(
    (sum, opening) => sum + opening.width * opening.height * (opening.quantity ?? 1),
    0,
  );
  const excludedArea = input.excludedArea ?? 0;
  const netWallArea = grossWallArea - openingArea - excludedArea;

  if (netWallArea < 0) {
    throw new Error('Las aberturas y exclusiones superan el área bruta de paredes');
  }

  const ceilingArea = input.includeCeiling ? floorArea : 0;
  const totalPaintableArea = netWallArea + ceilingArea;
  const effectiveCoverage = input.nominalCoverage * input.surfaceFactor * applicationFactor;
  const litersBeforeWaste = (totalPaintableArea * input.coats) / effectiveCoverage;
  const litersRequired = litersBeforeWaste * (1 + input.wastePercent / 100);

  return {
    floorArea: round(floorArea),
    grossWallArea: round(grossWallArea),
    openingArea: round(openingArea),
    netWallArea: round(netWallArea),
    ceilingArea: round(ceilingArea),
    totalPaintableArea: round(totalPaintableArea),
    effectiveCoverage: round(effectiveCoverage),
    litersBeforeWaste: round(litersBeforeWaste),
    litersRequired: round(litersRequired),
  };
}

export function optimizePackages(
  litersRequired: number,
  options: PackageOption[],
  maxUnits = 20,
): PackageSolution | null {
  assertPositive('Litros requeridos', litersRequired);
  const available = options.filter((option) => option.liters > 0 && option.price >= 0 && (option.stock ?? maxUnits) > 0);
  if (available.length === 0) return null;

  let best: PackageSolution | null = null;

  const visit = (index: number, selected: Array<PackageOption & { quantity: number }>): void => {
    if (index === available.length) {
      const totalLiters = selected.reduce((sum, item) => sum + item.liters * item.quantity, 0);
      if (totalLiters < litersRequired) return;
      const totalPrice = selected.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const leftoverLiters = totalLiters - litersRequired;
      const unitCount = selected.reduce((sum, item) => sum + item.quantity, 0);
      const score = totalPrice + leftoverLiters * 0.75 + unitCount * 0.05;
      const bestScore = best ? best.totalPrice + best.leftoverLiters * 0.75 + best.packages.reduce((sum, item) => sum + item.quantity, 0) * 0.05 : Infinity;

      if (score < bestScore) {
        best = {
          packages: selected.filter((item) => item.quantity > 0),
          totalLiters: round(totalLiters),
          totalPrice: round(totalPrice),
          leftoverLiters: round(leftoverLiters),
        };
      }
      return;
    }

    const option = available[index];
    const stockLimit = Math.min(option.stock ?? maxUnits, maxUnits);
    for (let quantity = 0; quantity <= stockLimit; quantity += 1) {
      visit(index + 1, [...selected, { ...option, quantity }]);
    }
  };

  visit(0, []);
  return best;
}
