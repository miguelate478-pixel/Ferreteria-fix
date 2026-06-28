import { Injectable } from '@nestjs/common';
import { calculatePaint, optimizePackages } from '@ferreteria/calculation-engine';
import { CalculatePaintDto } from './dto/calculate-paint.dto';

@Injectable()
export class CalculationsService {
  calculatePaint(input: CalculatePaintDto) {
    const calculation = calculatePaint(input);
    const packaging = optimizePackages(calculation.litersRequired, [
      { id: '1L', liters: 1, price: 31.9, stock: 20 },
      { id: '4L', liters: 4, price: 104.9, stock: 12 },
      { id: '15L', liters: 15, price: 329.9, stock: 3 },
    ]);
    return { calculation, packaging };
  }
}
