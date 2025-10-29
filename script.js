document.addEventListener('DOMContentLoaded', () => {
    const logEl = document.getElementById('log');
    const resultsDiv = document.getElementById('results');

    // GANTI DENGAN INFORMASI REPOSITORY ANDA
    const REPO_OWNER = 'salman-mustapa';
    const REPO_NAME = 'domain-scrapping';

    let pollingInterval;

    function startMonitoring() {
        if (pollingInterval) clearInterval(pollingInterval);

        pollingInterval = setInterval(async () => {
            try {
                // Cek log.txt untuk menampilkan proses
                const logResponse = await fetch('./log.txt?t=' + new Date().getTime());
                if (logResponse.ok) {
                    const logText = await logResponse.text();
                    logEl.textContent = logText;
                    logEl.scrollTop = logEl.scrollHeight;
                }

                // Cek apakah hasil sudah ada
                const domainsResponse = await fetch('./data/domains.json?t=' + new Date().getTime());
                if (domainsResponse.ok) {
                    clearInterval(pollingInterval);
                    displayResults();
                }
            } catch (error) {
                // Abaikan error jika file belum ada
            }
        }, 3000); // Cek setiap 3 detik
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
            console.error("Gagal menampilkan hasil:", error);
        }
    }

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

    // Mulai memantau saat halaman dimuat
    startMonitoring();
});