import json
import argparse
from urllib.parse import urlparse
from duckduckgo_search import DDGS

def scrape_and_save(keywords, separator):
    keyword_list = [k.strip() for k in keywords.split(separator) if k.strip()]
    if not keyword_list:
        print("[ERROR] Tidak ada kata kunci yang valid.")
        return

    all_unique_domains = set()
    all_scraped_urls = set()

    for keyword in keyword_list:
        print(f"[*] Memulai scraping untuk keyword: {keyword}...")
        try:
            with DDGS() as ddgs:
                for r in ddgs.text(keyword, region='wt-wt', safesearch='off', max_results=50):
                    if r and 'href' in r:
                        url = r['href']
                        if url not in all_scraped_urls:
                            all_scraped_urls.add(url)
                            parsed_url = urlparse(url)
                            domain = parsed_url.netloc
                            if domain:
                                all_unique_domains.add(domain)
        except Exception as e:
            print(f"[!] Gagal scraping untuk {keyword}: {e}")

    domains_path = 'data/domains.json'
    urls_path = 'data/urls.json'

    with open(domains_path, 'w') as f:
        json.dump(sorted(list(all_unique_domains)), f, indent=4)
    print(f"[+] {len(all_unique_domains)} domain unik disimpan di {domains_path}")

    with open(urls_path, 'w') as f:
        json.dump(sorted(list(all_scraped_urls)), f, indent=4)
    print(f"[+] {len(all_scraped_urls)} URL unik disimpan di {urls_path}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description="Scraper untuk DuckDuckGo.")
    parser.add_argument('--keywords', type=str, required=True, help='Kata kunci yang dipisah oleh separator.')
    parser.add_argument('--separator', type=str, default=',', help='Pemisah kata kunci (default: koma).')
    args = parser.parse_args()
    
    scrape_and_save(args.keywords, args.separator)