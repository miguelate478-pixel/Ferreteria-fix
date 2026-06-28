import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import type { Response } from 'express';

@Injectable()
export class QuotesService {
  streamDemoPdf(response: Response): void {
    const doc = new PDFDocument({ size: 'A4', margin: 48, info: { Title: 'Cotización - Taller de Color' } });
    response.setHeader('Content-Type', 'application/pdf');
    response.setHeader('Content-Disposition', 'inline; filename="cotizacion-demostracion.pdf"');
    doc.pipe(response);

    doc.fontSize(9).fillColor('#666666').text('TALLER DE COLOR · ESTUDIO DIGITAL DE PROYECTOS');
    doc.moveDown(1.2).fontSize(27).fillColor('#171815').text('Cotización de pintura');
    doc.fontSize(11).fillColor('#555555').text('Proyecto: Dormitorio principal · Vigencia: demostración');
    doc.moveDown(1.5);

    doc.fontSize(13).fillColor('#171815').text('Resumen técnico');
    doc.moveDown(.5).fontSize(10).fillColor('#333333');
    const summary = [
      ['Área de piso', '20.00 m²'],
      ['Área bruta de paredes', '45.00 m²'],
      ['Puerta y ventana', '3.69 m²'],
      ['Área neta pintable', '41.31 m²'],
      ['Número de manos', '2'],
      ['Pintura requerida', '10.69 L'],
    ];
    summary.forEach(([label, value]) => {
      doc.text(label, 48, doc.y, { continued: true, width: 300 });
      doc.text(value, { align: 'right' });
      doc.moveDown(.45);
    });

    doc.moveDown().fontSize(13).text('Productos y materiales');
    doc.moveDown(.6).fontSize(10);
    const lines = [
      ['Pintura recomendada color principal y acento', '3 envases de 4 L', 'S/ 314.70'],
      ['Masilla para reparación localizada', '1 unidad', 'S/ 54.90'],
      ['Lijas, cinta y protección', '1 conjunto', 'S/ 61.90'],
      ['Rodillo, brocha y bandeja', '1 conjunto', 'S/ 69.90'],
    ];
    lines.forEach(([description, quantity, price]) => {
      const y = doc.y;
      doc.text(description, 48, y, { width: 275 });
      doc.text(quantity, 325, y, { width: 100, align: 'right' });
      doc.text(price, 440, y, { width: 105, align: 'right' });
      doc.moveDown(1.35);
      doc.strokeColor('#dddddd').moveTo(48, doc.y).lineTo(547, doc.y).stroke();
      doc.moveDown(.6);
    });

    doc.moveDown().fontSize(12).text('Total estimado', 300, doc.y, { continued: true, width: 140, align: 'right' });
    doc.fontSize(21).text('S/ 501.40', { align: 'right' });

    doc.moveDown(2).fontSize(9).fillColor('#666666').text(
      'Documento de demostración. El resultado de color es referencial y puede variar por iluminación, pantalla, textura, acabado y lote. La implementación productiva debe congelar precios, stock, fórmulas y fichas técnicas dentro de la versión de la cotización.',
      { lineGap: 3 },
    );

    doc.end();
  }
}
