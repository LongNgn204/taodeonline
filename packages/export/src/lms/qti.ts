// Chú thích: QTI (IMS Question and Test Interoperability) Export
// Export sang định dạng QTI 2.1 cho các LMS chuẩn

import type { ExamContent, Question } from '@exam-matrix/shared';

interface QTIExportOptions {
    assessmentTitle?: string;
    identifier?: string;
}

/**
 * Generate unique identifier
 */
function generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
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
 * Generate QTI item for MCQ
 */
function generateMCQItem(question: Question): string {
    const itemId = generateId('item');
    const responseId = 'RESPONSE';
    const correctOptionId = `option_${question.answerKey}`;

    let optionsXml = '';
    let correctValue = '';

    if (question.options) {
        for (const opt of question.options) {
            const optionId = `option_${opt.label}`;
            if (opt.label === question.answerKey) {
                correctValue = optionId;
            }
            optionsXml += `
          <simpleChoice identifier="${optionId}">${escapeXml(opt.content)}</simpleChoice>`;
        }
    }

    return `
  <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                  identifier="${itemId}"
                  title="${escapeXml(question.id)}"
                  adaptive="false"
                  timeDependent="false">
    <responseDeclaration identifier="${responseId}" cardinality="single" baseType="identifier">
      <correctResponse>
        <value>${correctValue}</value>
      </correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue><value>0</value></defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <choiceInteraction responseIdentifier="${responseId}" shuffle="false" maxChoices="1">
        <prompt>${escapeXml(question.prompt)}</prompt>${optionsXml}
      </choiceInteraction>
    </itemBody>
    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
  </assessmentItem>`;
}

/**
 * Generate QTI item for Short Answer
 */
function generateShortAnswerItem(question: Question): string {
    const itemId = generateId('item');
    const responseId = 'RESPONSE';

    return `
  <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                  identifier="${itemId}"
                  title="${escapeXml(question.id)}"
                  adaptive="false"
                  timeDependent="false">
    <responseDeclaration identifier="${responseId}" cardinality="single" baseType="string">
      <correctResponse>
        <value>${escapeXml(question.answerKey)}</value>
      </correctResponse>
    </responseDeclaration>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue><value>0</value></defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <textEntryInteraction responseIdentifier="${responseId}" expectedLength="50">
        <prompt>${escapeXml(question.prompt)}</prompt>
      </textEntryInteraction>
    </itemBody>
    <responseProcessing template="http://www.imsglobal.org/question/qti_v2p1/rptemplates/match_correct"/>
  </assessmentItem>`;
}

/**
 * Generate QTI item for Essay
 */
function generateEssayItem(question: Question): string {
    const itemId = generateId('item');
    const responseId = 'RESPONSE';

    return `
  <assessmentItem xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                  identifier="${itemId}"
                  title="${escapeXml(question.id)}"
                  adaptive="false"
                  timeDependent="false">
    <responseDeclaration identifier="${responseId}" cardinality="single" baseType="string"/>
    <outcomeDeclaration identifier="SCORE" cardinality="single" baseType="float">
      <defaultValue><value>0</value></defaultValue>
    </outcomeDeclaration>
    <itemBody>
      <extendedTextInteraction responseIdentifier="${responseId}" expectedLines="10">
        <prompt>${escapeXml(question.prompt)}</prompt>
      </extendedTextInteraction>
    </itemBody>
  </assessmentItem>`;
}

/**
 * Export exam to QTI 2.1 format
 */
export function exportToQTI(
    exam: ExamContent,
    options: QTIExportOptions = {}
): string {
    const assessmentId = options.identifier || generateId('assessment');
    const title = options.assessmentTitle || exam.title;

    let itemsXml = '';

    for (const section of exam.sections) {
        for (const question of section.questions) {
            switch (question.type) {
                case 'MCQ':
                    itemsXml += generateMCQItem(question);
                    break;
                case 'SHORT':
                    itemsXml += generateShortAnswerItem(question);
                    break;
                case 'ESSAY':
                    itemsXml += generateEssayItem(question);
                    break;
                // TF questions are converted to multiple MCQs in QTI
                case 'TF':
                    if (question.tfItems) {
                        for (const item of question.tfItems) {
                            const tfQuestion: Question = {
                                ...question,
                                id: `${question.id}_${item.id}`,
                                prompt: item.statement,
                                type: 'MCQ',
                                options: [
                                    { label: 'A', content: 'Đúng' },
                                    { label: 'B', content: 'Sai' },
                                ],
                                answerKey: item.isTrue ? 'A' : 'B',
                            };
                            itemsXml += generateMCQItem(tfQuestion);
                        }
                    }
                    break;
            }
        }
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<assessmentTest xmlns="http://www.imsglobal.org/xsd/imsqti_v2p1"
                identifier="${assessmentId}"
                title="${escapeXml(title)}">
  <testPart identifier="testPart1" navigationMode="linear" submissionMode="individual">
    <assessmentSection identifier="section1" title="${escapeXml(exam.subject)}" visible="true">
${itemsXml}
    </assessmentSection>
  </testPart>
</assessmentTest>`;
}

export default { exportToQTI };
