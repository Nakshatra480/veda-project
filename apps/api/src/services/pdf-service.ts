import PDFDocument from "pdfkit";
import { type IQuestionPaper } from "../models/question-paper.js";
import { QUESTION_TYPE_LABELS } from "@vedaai/shared";

export function generatePdf(paper: IQuestionPaper): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 50, bottom: 50, left: 60, right: 60 },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text(paper.title, { align: "center" });

    doc.moveDown(0.3);
    doc
      .fontSize(12)
      .font("Helvetica")
      .text(`Subject: ${paper.subject}    |    Grade: ${paper.grade}    |    Total Marks: ${paper.totalMarks}`, {
        align: "center",
      });

    if (paper.duration) {
      doc.text(`Duration: ${paper.duration}`, { align: "center" });
    }

    doc.text(`Date: ${new Date().toLocaleDateString("en-IN")}`, { align: "center" });

    doc.moveDown(0.8);
    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .strokeColor("#333333")
      .lineWidth(1)
      .stroke();
    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .font("Helvetica")
      .text("Name: ________________________________________     Roll No: ______________     Section: __________");

    doc.moveDown(0.5);
    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .strokeColor("#333333")
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.5);

    if (paper.generalInstructions && paper.generalInstructions.length > 0) {
      doc
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("General Instructions:");
      doc.moveDown(0.3);
      doc.fontSize(10).font("Helvetica");
      paper.generalInstructions.forEach((instruction, idx) => {
        doc.text(`${idx + 1}. ${instruction}`, { indent: 15 });
      });
      doc.moveDown(0.5);
      doc
        .moveTo(60, doc.y)
        .lineTo(535, doc.y)
        .strokeColor("#cccccc")
        .lineWidth(0.5)
        .stroke();
      doc.moveDown(0.5);
    }

    paper.sections.forEach((section) => {
      // Estimate section header height: label/title + instruction
      const estSectionHeaderHeight = 40 + (section.instruction ? Math.ceil(section.instruction.length / 80) * 12 : 0);
      if (doc.y + estSectionHeaderHeight > 750) {
        doc.addPage();
      }

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .text(`${section.label}: ${section.title}`);

      if (section.instruction) {
        doc
          .fontSize(9)
          .font("Helvetica-Oblique")
          .text(section.instruction, { indent: 10 });
      }

      doc.moveDown(0.4);

      section.questions.forEach((question) => {
        const typeName = QUESTION_TYPE_LABELS[question.type] || question.type;
        // Estimate height for question text and options to determine if it fits
        const textLength = question.text.length + typeName.length + 30;
        const estTextHeight = Math.ceil(textLength / 75) * 15;
        const estOptionsHeight = question.options ? question.options.length * 15 : 0;
        const estQuestionHeight = estTextHeight + estOptionsHeight + 10;

        if (doc.y + estQuestionHeight > 750) {
          doc.addPage();
        }

        doc
          .fontSize(11)
          .font("Helvetica-Bold")
          .text(`Q${question.questionNumber}.`, { continued: true })
          .font("Helvetica")
          .text(` ${question.text}`, { continued: true })
          .fontSize(9)
          .font("Helvetica-Oblique")
          .text(`  [${question.marks} marks | ${typeName} | ${question.difficulty}]`);

        if (question.options && question.options.length > 0) {
          doc.moveDown(0.2);
          const labels = ["(a)", "(b)", "(c)", "(d)", "(e)", "(f)", "(g)", "(h)"];
          question.options.forEach((option, idx) => {
            doc
              .fontSize(10)
              .font("Helvetica")
              .text(`    ${labels[idx] || `(${idx + 1})`} ${option}`);
          });
        }

        doc.moveDown(0.6);
      });

      doc.moveDown(0.3);
    });

    doc.moveDown(1);
    doc
      .moveTo(60, doc.y)
      .lineTo(535, doc.y)
      .strokeColor("#333333")
      .lineWidth(0.5)
      .stroke();
    doc.moveDown(0.3);
    doc
      .fontSize(9)
      .font("Helvetica-Oblique")
      .text("--- End of Question Paper ---", { align: "center" });

    doc.end();
  });
}
