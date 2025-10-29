document.addEventListener('DOMContentLoaded', () => {
    const logEl = document.getElementById('log');
    const keywordsInput = document.getElementById('keywords');
    const separatorInput = document.getElementById('separator');
    const scrapBtn = document.getElementById('scrapBtn');
    const resultsDiv = document.getElementById('results');

    // GANTI DENGAN INFORMASI REPOSITORY ANDA
    const REPO_OWNER = 'salman-mustapa';
    const REPO_NAME = 'domain-scrapping';

    let pollingInterval;

    function log(message) {
        logEl.textContent += message + '\n';
        logEl.scrollTop = logEl.scrollHeight;
    }

    async function triggerScraping(keywords, separator) {
        log(`[API] Membuat issue baru untuk memicu scraping...`);
        const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`, {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title: keywords,
                body: `Separator: ${separator}`,
                labels: ['scrap-request']
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gagal membuat issue: ${error.message}`);
        }
        const issue = await response.json();
        log(`[API] Issue #${issue.number} berhasil dibuat. Memantau proses...`);
        startMonitoring();
    }

    function startMonitoring() {
        log('[MONITOR] Memulai pemantauan log...');
        if (pollingInterval) clearInterval(pollingInterval);

        pollingInterval = setInterval(async () => {
            try {
                const logResponse = await fetch('./log.txt?t=' + new Date().getTime());
                if (logResponse.ok) {
                    const logText = await logResponse.text();
                    logEl.textContent = logText;
                    logEl.scrollTop = logEl.scrollHeight;
                }

                const domainsResponse = await fetch('./data/domains.json?t=' + new Date().getTime());
                if (domainsResponse.ok) {
                    log('[SUCCESS] Scraping selesai. Menampilkan hasil.');
                    clearInterval(pollingInterval);
                    scrapBtn.disabled = false;
                    scrapBtn.textContent = 'EXECUTE_SCRAPER.SH';
                    displayResults();
                }
            } catch (error) {
                // Abaikan error saat file belum ada
            }
        }, 5000); // Cek setiap 5 detik
    }

    async function displayResults() {
        try {
            const [domainsResponse, urlsResponse] = await Promise.all([
                fetch('./data/domains.json'),
                fetch('./data/urls.json')
            ]);
            const domains = await domainsResponse.json();
            const urls = await urlsResponse.json();

            document.getElementById('domainCount').textContent = domains.length;
            document.getElementById('urlCount').textContent = urls.length;

            const domainList = document.getElementById('domainList');
            const urlList = document.getElementById('urlList');
            domainList.innerHTML = '';
            urlList.innerHTML = '';
            
            domains.forEach(d => {
                const li = document.createElement('li');
                li.textContent = d;
                domainList.appendChild(li);
            });
            urls.forEach(u => {
                const li = document.createElement('li');
                li.textContent = u;
                urlList.appendChild(li);
            });

            resultsDiv.style.display = 'block';
        } catch (error) {
            log(`[ERROR] Gagal menampilkan hasil: ${error.message}`);
        }
    }

    scrapBtn.addEventListener('click', async () => {
        const keywords = keywordsInput.value;
        const separator = separatorInput.value || ',';

        if (!keywords) {
            log('[ERROR] Kata kunci tidak boleh kosong.');
            return;
        }

        scrapBtn.disabled = true;
        scrapBtn.textContent = 'RUNNING...';
        resultsDiv.style.display = 'none';
        logEl.textContent = '';

        try {
            await triggerScraping(keywords, separator);
        } catch (error) {
            log(`[ERROR] ${error.message}`);
            scrapBtn.disabled = false;
            scrapBtn.textContent = 'EXECUTE_SCRAPER.SH';
        }
    });

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            button.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Download functionality
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.getAttribute('data-target');
            window.location.href = `./data/${target}.json`;
        });
    });
});