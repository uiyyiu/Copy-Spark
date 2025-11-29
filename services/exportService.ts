import type { LessonPlan, IdeaSection } from '../types';

const escapeHtml = (unsafe: string) => 
    unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

export const formatTextToHtml = (text: string): string => {
    if (!text) return '';
    
    const processLineFormatting = (line: string): string => {
        const regex = /(«[^»]+»)|("[^"]+")|(\([^)]+\d+[:.]\d+[^)]*\))/g;
        return line.split(regex).map((part) => {
            if (!part) return '';
            const escapedPart = escapeHtml(part);
            if (part.startsWith('«') || part.startsWith('"')) {
                return `<em class="quote">${escapedPart}</em>`;
            }
            if (part.startsWith('(') && part.includes(':')) {
                return `<strong class="verse">${escapedPart}</strong>`;
            }
            return escapedPart;
        }).join('');
    };

    const lines = text.trim().split('\n');
    let html = '';
    let inList = false;
    let listType = 'ul';

    for (const line of lines) {
        const trimmedLine = line.trim();
        const isBulletedListItem = /^\s*[-*]\s+/.test(trimmedLine);
        const isNumberedListItem = /^\s*\*?(\d+[-.]?)\*?\s+/.test(trimmedLine);
        const isSubheading = /^\s*\*\*.+\*\*\s*:?$/.test(trimmedLine) && !isBulletedListItem && !isNumberedListItem;

        if (isSubheading) {
            if (inList) {
                html += `</${listType}>`;
                inList = false;
            }
            html += `<h4>${processLineFormatting(trimmedLine)}</h4>`;
            continue;
        }
        
        if (isBulletedListItem || isNumberedListItem) {
            const currentListType = isNumberedListItem ? 'ol' : 'ul';
            if (!inList || currentListType !== listType) {
                if (inList) {
                    html += `</${listType}>`;
                }
                html += `<${currentListType}>`;
                inList = true;
                listType = currentListType;
            }
            const content = trimmedLine.replace(/^\s*(\*?\d+[-.]?\*?|[-*])\s+/, '');
            html += `<li>${processLineFormatting(content)}</li>`;
            continue;
        }

        if (inList) {
            html += `</${listType}>`;
            inList = false;
        }

        if (trimmedLine.length > 0) {
            html += `<p>${processLineFormatting(trimmedLine)}</p>`;
        }
    }

    if (inList) {
        html += `</${listType}>`;
    }

    return html;
};

export interface ParsedExplanation {
  elements: string[];
  lessonBody: string;
  references: string[];
}

export const parseLessonExplanation = (explanation?: string): ParsedExplanation => {
  if (!explanation) {
    return { elements: [], lessonBody: '', references: [] };
  }
  
  // Use regex to find the indices of each section header. `m` flag for multiline.
  const ELEMENTS_HEADER = /(^\s*\*?اولاً?\s+العناصر\s*:?\*?\s*$)/m;
  const LESSON_HEADER =   /(^\s*\*?ثانياً?\s+الدرس\s*:?\*?\s*$)/m;
  const REFS_HEADER =     /(^\s*\*?ثالثاً?\s+المراجع\s*:?\*?\s*$)/m;

  const elementsMatch = explanation.match(ELEMENTS_HEADER);
  const lessonMatch = explanation.match(LESSON_HEADER);
  const refsMatch = explanation.match(REFS_HEADER);
  
  // Create an array of found sections with their start indices.
  const sections = [];
  if (elementsMatch) sections.push({ name: 'elements', index: elementsMatch.index!, headerLength: elementsMatch[0].length });
  if (lessonMatch) sections.push({ name: 'lesson', index: lessonMatch.index!, headerLength: lessonMatch[0].length });
  if (refsMatch) sections.push({ name: 'references', index: refsMatch.index!, headerLength: refsMatch[0].length });

  // Sort sections by their index to handle them in order.
  sections.sort((a, b) => a.index - b.index);

  let elementsText = '';
  let lessonBodyText = '';
  let referencesText = '';
  
  // Slice the explanation string based on section indices.
  for (let i = 0; i < sections.length; i++) {
    const currentSection = sections[i];
    const nextSection = sections[i + 1];
    
    const start = currentSection.index + currentSection.headerLength;
    const end = nextSection ? nextSection.index : explanation.length;
    const content = explanation.substring(start, end).trim();

    if (currentSection.name === 'elements') elementsText = content;
    else if (currentSection.name === 'lesson') lessonBodyText = content;
    else if (currentSection.name === 'references') referencesText = content;
  }

  // Fallback if no sections were parsed correctly.
  if (sections.length === 0 && explanation.trim()) {
      return { elements: [], lessonBody: explanation, references: [] };
  }

  const parseListLines = (text: string) => text.split('\n')
    .map(line => line.trim().replace(/^\s*(\d+[-.]?|[-*])\s*/, ''))
    .filter(Boolean);

  return {
    elements: parseListLines(elementsText),
    lessonBody: lessonBodyText, // Keep the full body with markdown for formatTextToHtml
    references: parseListLines(referencesText),
  };
};

const formatSectionAsText = (section: IdeaSection): string => {
    let sectionText = `\n\n## ${section.title} ##\n\n`;
    section.ideas.forEach((idea, index) => {
        sectionText += `${idea.selected ? '[✓]' : '[ ]'} ${index + 1}. ${idea.text}\n`;
    });
    return sectionText;
};

export const formatAsText = (lessonPlan: LessonPlan, lessonTitle: string, spiritualObjective: string, scriptureVerse: string): string => {
    let content = `# ${lessonTitle}\n\n`;
    content += `**الهدف الروحي:** ${spiritualObjective}\n`;
    if (scriptureVerse) {
        content += `**آية الدرس:** ${scriptureVerse}\n`;
    }
    content += `\n----------\n\n`;
    content += `## شرح الدرس ##\n\n${lessonPlan.lessonExplanation}\n\n`;
    if (lessonPlan.verseExplanation) {
        content += `## شرح الآية ##\n\n${lessonPlan.verseExplanation}\n\n`;
    }
    content += `----------`;
    content += formatSectionAsText(lessonPlan.warmUp);
    content += formatSectionAsText(lessonPlan.illustration);
    if (lessonPlan.verseGame && lessonPlan.verseGame.ideas.length > 0) {
        content += formatSectionAsText(lessonPlan.verseGame);
    }
    content += formatSectionAsText(lessonPlan.application);
    content += formatSectionAsText(lessonPlan.practice);
    content += `\n\n----------\nGenerated with Spark`;
    return content;
};

const formatSectionAsHtml = (section: IdeaSection): string => `
    <div class="section">
        <h2 class="section-title">${section.title}</h2>
        <ul class="idea-list">
            ${section.ideas.map(idea => `
                <li class="idea-item ${idea.selected ? 'selected' : ''}">
                    <span class="checkbox">${idea.selected ? '☑' : '☐'}</span>
                    <p>${idea.text.replace(/\n/g, '<br>')}</p>
                </li>
            `).join('')}
        </ul>
    </div>
`;

export const formatAsHtml = (lessonPlan: LessonPlan, lessonTitle: string, spiritualObjective: string, scriptureVerse: string, theme: 'light' | 'dark'): string => {
    const isDarkMode = theme === 'dark';
    
    const styles = `
        :root {
            --primary-color: #f59e0b;
            --text-color: ${isDarkMode ? '#cbd5e1' : '#334155'};
            --text-color-light: ${isDarkMode ? '#94a3b8' : '#64748b'};
            --bg-color: ${isDarkMode ? '#1e293b' : '#ffffff'};
            --bg-color-alt: ${isDarkMode ? '#0f172a' : '#f8fafc'};
            --border-color: ${isDarkMode ? '#334155' : '#e2e8f0'};
            --selected-bg-color: ${isDarkMode ? 'rgba(245, 158, 11, 0.1)' : '#fef3c7'};
            --selected-checkbox-color: ${isDarkMode ? '#65a30d' : '#16a34a'};
        }
        body { font-family: 'Cairo', sans-serif; direction: rtl; background-color: var(--bg-color-alt); color: var(--text-color); margin: 0; padding: 1rem; }
        .container { max-width: 800px; margin: auto; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 2rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        h1, h2, h4 { font-family: 'Noto Naskh Arabic', serif; }
        .header { text-align: center; border-bottom: 2px solid var(--primary-color); padding-bottom: 1rem; margin-bottom: 1rem; }
        .header h1 { margin: 0; }
        .objective { text-align: center; font-style: italic; color: var(--text-color-light); margin-bottom: 0.5rem; font-size: 1.1rem; }
        .verse-header { text-align: center; color: var(--text-color-light); margin-bottom: 2rem; font-size: 1.1rem; }
        .section { margin-bottom: 2rem; border: 1px solid var(--border-color); padding: 1.5rem; border-radius: 8px; }
        .section-title { margin-top: 0; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; color: var(--primary-color); }
        .explanation-text { line-height: 1.9; font-size: 1.1rem; }
        .explanation-text p { margin-bottom: 1rem; }
        .explanation-text h4 { margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.2em; color: var(--text-color); }
        .explanation-text ul, .explanation-text ol { padding-right: 2rem; }
        .idea-list { list-style: none; padding: 0; }
        .idea-item { display: flex; align-items: flex-start; margin-bottom: 1rem; padding: 0.5rem; border-radius: 6px; transition: background-color 0.2s; }
        .idea-item.selected { background-color: var(--selected-bg-color); }
        .idea-item p { margin: 0; }
        .checkbox { font-size: 1.2rem; margin-left: 0.75rem; color: var(--text-color-light); }
        .idea-item.selected .checkbox { color: var(--selected-checkbox-color); }
    `;
    
    const verseHtml = scriptureVerse ? `<p class="verse-header"><strong>آية الدرس:</strong> ${escapeHtml(scriptureVerse)}</p>` : '';
    const verseExplanationHtml = lessonPlan.verseExplanation ? `
        <div class="section">
            <h2 class="section-title">شرح الآية</h2>
            <div class="explanation-text">${formatTextToHtml(lessonPlan.verseExplanation)}</div>
        </div>
    ` : '';

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lessonTitle}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&family=Noto+Naskh+Arabic:wght@400;700&display=swap" rel="stylesheet">
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${lessonTitle}</h1>
        </div>
        <p class="objective">${spiritualObjective}</p>
        ${verseHtml}
        <div class="section">
            <h2 class="section-title">شرح الدرس</h2>
            <div class="explanation-text">${formatTextToHtml(lessonPlan.lessonExplanation)}</div>
        </div>
        ${verseExplanationHtml}
        ${formatSectionAsHtml(lessonPlan.warmUp)}
        ${formatSectionAsHtml(lessonPlan.illustration)}
        ${lessonPlan.verseGame && lessonPlan.verseGame.ideas.length > 0 ? formatSectionAsHtml(lessonPlan.verseGame) : ''}
        ${formatSectionAsHtml(lessonPlan.application)}
        ${formatSectionAsHtml(lessonPlan.practice)}
    </div>
</body>
</html>
    `;
};

export const formatExplanationAsHtml = (
    lessonTitle: string,
    spiritualObjective: string,
    elements: string[],
    lessonBody: string,
    references: string[],
    theme: 'light' | 'dark'
): string => {
    const isDarkMode = theme === 'dark';
    
    const styles = `
        :root {
            --primary-color: #f59e0b;
            --secondary-color: #0ea5e9;
            --text-color: ${isDarkMode ? '#cbd5e1' : '#334155'};
            --text-color-light: ${isDarkMode ? '#94a3b8' : '#64748b'};
            --bg-color: ${isDarkMode ? '#1e293b' : '#ffffff'};
            --bg-color-alt: ${isDarkMode ? '#0f172a' : '#f8fafc'};
            --border-color: ${isDarkMode ? '#334155' : '#e2e8f0'};
        }
        body { font-family: 'Cairo', sans-serif; direction: rtl; background-color: var(--bg-color-alt); color: var(--text-color); margin: 0; padding: 2rem; line-height: 1.8; }
        .container { max-width: 800px; margin: auto; background-color: var(--bg-color); border: 1px solid var(--border-color); border-radius: 12px; padding: 2.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.1); }
        h1, h2, h3, h4 { font-family: 'Noto Naskh Arabic', serif; }
        .header { text-align: center; border-bottom: 2px solid var(--primary-color); padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .header h1 { margin: 0 0 0.5rem 0; font-size: 2.5rem; }
        .objective { text-align: center; font-style: italic; color: var(--text-color-light); margin-bottom: 2rem; font-size: 1.2rem; }
        .section { margin-bottom: 2rem; }
        .section-title { margin-top: 0; margin-bottom: 1.5rem; font-size: 1.8rem; color: var(--primary-color); }
        .explanation-text { font-family: 'Noto Naskh Arabic', serif; font-size: 1.2rem; line-height: 1.9; }
        .explanation-text p { margin-bottom: 1rem; }
        .explanation-text h4 { font-family: 'Cairo', sans-serif; margin-top: 2rem; margin-bottom: 0.75rem; font-size: 1.1em; }
        .explanation-text ul, .explanation-text ol { padding-right: 2rem; margin-bottom: 1rem; }
        .explanation-text li { margin-bottom: 0.5rem; }
        .explanation-text .quote { color: var(--primary-color); font-style: normal; font-weight: 600; }
        .explanation-text .verse { color: var(--secondary-color); font-weight: 700; }
        .references-title { font-size: 1.8rem; color: var(--secondary-color); margin-top: 3rem; border-top: 1px solid var(--border-color); padding-top: 2rem; margin-bottom: 1.5rem;}
        .references-list { list-style-type: '✼ '; padding-right: 2rem; font-size: 1.1rem; }
        .references-list li { margin-bottom: 0.75rem; }
        @media print {
            body { padding: 0; background-color: #fff; color: #000; font-size: 12pt; }
            .container { box-shadow: none; border: none; padding: 0; }
            .header h1 { font-size: 2rem; }
            .objective { font-size: 1.1rem; }
            .explanation-text { font-size: 1.1rem; }
            .references-list { font-size: 1rem; }
        }
    `;
    
    const formattedBody = formatTextToHtml(lessonBody);

    const elementsHtml = elements.length > 0 ? `
        <div class="section">
            <h2 class="section-title">اولا العناصر :</h2>
            <ol class="references-list" style="list-style-type: decimal; padding-right: 2rem;">
                ${elements.map(ref => `<li>${escapeHtml(ref)}</li>`).join('')}
            </ol>
        </div>
    ` : '';

    const bodyHtml = lessonBody ? `
        <div class="section">
             <h2 class="section-title">ثانيا الدرس :</h2>
             <div class="explanation-text">${formattedBody}</div>
        </div>
    ` : '';
    
    const referencesHtml = references.length > 0
        ? `<div class="section">
             <h2 class="references-title">ثالثا المراجع :</h2>
             <ul class="references-list">${references.map(ref => `<li>${escapeHtml(ref)}</li>`).join('')}</ul>
           </div>`
        : '';

    return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${lessonTitle} - شرح الدرس</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap" rel="stylesheet">
    <style>${styles}</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${lessonTitle}</h1>
        </div>
        <p class="objective">${spiritualObjective}</p>
        ${elementsHtml}
        ${bodyHtml}
        ${referencesHtml}
    </div>
</body>
</html>
    `;
};