document.addEventListener('DOMContentLoaded', () => {
    // --- DATA ---
    const bibleBooks = [
        { id: 'john', name: 'إنجيل يوحنا', chapters: 21 },
        { id: 'mark', name: 'إنجيل مرقس', chapters: 16 },
        { id: 'genesis', name: 'سفر التكوين', chapters: 50 },
    ];

    const manuscriptLinks = {
        "john-1": {
            sinaiticus: "https://www.codexsinaiticus.org/en/manuscript.aspx?book=36&chapter=1",
            vaticanus: "https://digi.vatlib.it/view/MSS_Vat.gr.1209/0288",
            alexandrinus: "https://www.bl.uk/manuscripts/Viewer.aspx?ref=royal_ms_1_d_viii_f003r"
        },
        "mark-1": {
            sinaiticus: "https://www.codexsinaiticus.org/en/manuscript.aspx?book=34&chapter=1",
            vaticanus: "https://digi.vatlib.it/view/MSS_Vat.gr.1209/0245",
            alexandrinus: "https://www.bl.uk/manuscripts/Viewer.aspx?ref=royal_ms_1_d_viii_f054r"
        },
        "genesis-1": {
            sinaiticus: null, // Not fully available in Sinaiticus
            vaticanus: "https://digi.vatlib.it/view/MSS_Vat.gr.1209/0007",
            alexandrinus: "https://www.bl.uk/manuscripts/Viewer.aspx?ref=royal_ms_1_d_v_f005r"
        }
    };

    const manuscriptDescriptions = {
        sinaiticus: "مخطوطة يونانية من القرن الرابع، اكتُشفت في دير سانت كاترين.",
        vaticanus: "مخطوطة يونانية من القرن الرابع، محفوظة في مكتبة الفاتيكان.",
        alexandrinus: "مخطوطة بيزنطية من القرن الخامس، موجودة في المكتبة البريطانية."
    };

    // --- DOM ELEMENTS ---
    const bookSelect = document.getElementById('book-select');
    const chapterInput = document.getElementById('chapter-input');
    const loadBtn = document.getElementById('load-btn');
    const manuscriptSection = document.getElementById('manuscript-section');

    // --- FUNCTIONS ---
    function populateBookSelector() {
        bibleBooks.forEach(book => {
            const option = document.createElement('option');
            option.value = book.id;
            option.textContent = book.name;
            bookSelect.appendChild(option);
        });
    }

    function loadChapterData() {
        const bookId = bookSelect.value;
        const chapter = chapterInput.value;
        const key = `${bookId}-${chapter}`;

        const links = manuscriptLinks[key];
        
        manuscriptSection.style.display = 'block';

        updateManuscriptTab('sinaiticus', links ? links.sinaiticus : null);
        updateManuscriptTab('vaticanus', links ? links.vaticanus : null);
        updateManuscriptTab('alexandrinus', links ? links.alexandrinus : null);

        // Placeholder for chapter text
        document.getElementById('chapter-content').innerHTML = `<p>تم تحميل ${bookSelect.options[bookSelect.selectedIndex].text} - الأصحاح ${chapter}.</p>`;
    }

    function updateManuscriptTab(manuscriptName, url) {
        const tabContent = document.getElementById(`tab-${manuscriptName}`);
        if (url) {
            tabContent.innerHTML = `
                <div class="manuscript-card">
                    <p>${manuscriptDescriptions[manuscriptName]}</p>
                    <a href="${url}" target="_blank" rel="noopener noreferrer">عرض المخطوطة</a>
                </div>
            `;
        } else {
            tabContent.innerHTML = `
                <div class="manuscript-card">
                    <p>المخطوطة غير متاحة لهذا الأصحاح.</p>
                </div>
            `;
        }
    }

    // This function will be global as it's called from HTML onclick
    window.switchTab = (tabName) => {
        // Deactivate all tabs and content
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Activate the selected tab and content
        document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add('active');
        document.getElementById(`tab-${tabName}`).classList.add('active');
    };

    // --- INITIALIZATION & EVENT LISTENERS ---
    populateBookSelector();
    loadBtn.addEventListener('click', loadChapterData);
});
