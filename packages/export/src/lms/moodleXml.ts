// Chú thích: Moodle XML Export
// Export đề thi sang định dạng Moodle XML để import vào hệ thống Moodle

import type { ExamContent, Question } from '@exam-matrix/shared';

interface MoodleExportOptions {
    categoryName?: string;
    includeAnswerFeedback?: boolean;
    shuffleAnswers?: boolean;
}

/**
 * Escape XML special characters
 */
function escapeXml(text: string): string {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Convert HTML subscript/superscript to Moodle format
 */
function formatChemicalNotation(text: string): string {
    // H₂O -> H<sub>2</sub>O
    // CO₂ -> CO<sub>2</sub>
    const subscriptMap: Record<string, string> = {
        '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4',
        '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    };
    const superscriptMap: Record<string, string> = {
        '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4',
        '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
        '⁺': '+', '⁻': '-',
    };

    let result = text;

    // Replace subscripts
    for (const [char, num] of Object.entries(subscriptMap)) {
        result = result.replace(new RegExp(char, 'g'), `<sub>${num}</sub>`);
    }

    // Replace superscripts
    for (const [char, num] of Object.entries(superscriptMap)) {
        result = result.replace(new RegExp(char, 'g'), `<sup>${num}</sup>`);
    }

    return result;
}

/**
 * Generate Moodle XML for a MCQ question
 */
function generateMCQXml(question: Question, options: MoodleExportOptions): string {
    const questionText = formatChemicalNotation(escapeXml(question.prompt));
    const shuffle = options.shuffleAnswers ? 'true' : 'false';

    let xml = `
  <question type="multichoice">
    <name><text>${escapeXml(question.id)}</text></name>
    <questiontext format="html">
      <text><![CDATA[<p>${questionText}</p>]]></text>
    </questiontext>
    <defaultgrade>${question.points}</defaultgrade>
    <penalty>0.3333333</penalty>
    <hidden>0</hidden>
    <single>true</single>
    <shuffleanswers>${shuffle}</shuffleanswers>
    <answernumbering>abc</answernumbering>`;

    if (question.options) {
        for (const opt of question.options) {
            const isCorrect = opt.label === question.answerKey;
            const fraction = isCorrect ? 100 : 0;
            const optionText = formatChemicalNotation(escapeXml(opt.content));

            xml += `
    <answer fraction="${fraction}" format="html">
      <text><![CDATA[<p>${optionText}</p>]]></text>
      ${options.includeAnswerFeedback ? `<feedback format="html"><text><![CDATA[${isCorrect ? 'Đáp án đúng!' : 'Đáp án sai.'}]]></text></feedback>` : ''}
    </answer>`;
        }
    }

    xml += `
  </question>`;

    return xml;
}

/**
 * Generate Moodle XML for a True/False question
 */
function generateTFXml(question: Question, options: MoodleExportOptions): string {
    const questionText = formatChemicalNotation(escapeXml(question.prompt));

    let xml = `
  <question type="cloze">
    <name><text>${escapeXml(question.id)}</text></name>
    <questiontext format="html">
      <text><![CDATA[<p>${questionText}</p>`;

    if (question.tfItems) {
        xml += '<ol type="a">';
        for (const item of question.tfItems) {
            const correctAnswer = item.isTrue ? 'Đúng' : 'Sai';
            xml += `<li>${formatChemicalNotation(escapeXml(item.statement))} {1:MULTICHOICE:${correctAnswer}~${item.isTrue ? 'Sai' : 'Đúng'}}</li>`;
        }
        xml += '</ol>';
    }

    xml += `]]></text>
    </questiontext>
    <defaultgrade>${question.points}</defaultgrade>
  </question>`;

    return xml;
}

/**
 * Generate Moodle XML for a short answer question
 */
function generateShortAnswerXml(question: Question, options: MoodleExportOptions): string {
    const questionText = formatChemicalNotation(escapeXml(question.prompt));
    const correctAnswer = escapeXml(question.answerKey);

    return `
  <question type="shortanswer">
    <name><text>${escapeXml(question.id)}</text></name>
    <questiontext format="html">
      <text><![CDATA[<p>${questionText}</p>]]></text>
    </questiontext>
    <defaultgrade>${question.points}</defaultgrade>
    <usecase>0</usecase>
    <answer fraction="100" format="moodle_auto_format">
      <text>${correctAnswer}</text>
      ${options.includeAnswerFeedback ? '<feedback format="html"><text>Đáp án đúng!</text></feedback>' : ''}
    </answer>
  </question>`;
}

/**
 * Generate Moodle XML for an essay question
 */
function generateEssayXml(question: Question, options: MoodleExportOptions): string {
    const questionText = formatChemicalNotation(escapeXml(question.prompt));

    return `
  <question type="essay">
    <name><text>${escapeXml(question.id)}</text></name>
    <questiontext format="html">
      <text><![CDATA[<p>${questionText}</p>]]></text>
    </questiontext>
    <defaultgrade>${question.points}</defaultgrade>
    <responseformat>editor</responseformat>
    <responserequired>1</responserequired>
    <responsefieldlines>15</responsefieldlines>
    <attachments>0</attachments>
    <graderinfo format="html">
      <text><![CDATA[<p><strong>Hướng dẫn chấm:</strong></p><p>${escapeXml(question.solution || question.answerKey)}</p>]]></text>
    </graderinfo>
  </question>`;
}

/**
 * Export exam to Moodle XML format
 */
export function exportToMoodleXml(
    exam: ExamContent,
    options: MoodleExportOptions = {}
): string {
    const categoryName = options.categoryName || `${exam.subject} - ${exam.title}`;

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<quiz>
  <question type="category">
    <category>
      <text>$course$/${escapeXml(categoryName)}</text>
    </category>
  </question>`;

    for (const section of exam.sections) {
        for (const question of section.questions) {
            switch (question.type) {
                case 'MCQ':
                    xml += generateMCQXml(question, options);
                    break;
                case 'TF':
                    xml += generateTFXml(question, options);
                    break;
                case 'SHORT':
                    xml += generateShortAnswerXml(question, options);
                    break;
                case 'ESSAY':
                    xml += generateEssayXml(question, options);
                    break;
            }
        }
    }

    xml += `
</quiz>`;

    return xml;
}

export default { exportToMoodleXml };
