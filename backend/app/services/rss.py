import feedparser
from typing import List, Dict
import hashlib

def parse_feed(url: str) -> List[Dict]:
    feed = feedparser.parse(url)
    entries = []
    for entry in feed.entries:
        # Create a unique hash for deduplication
        title = entry.get('title', '')
        link = entry.get('link', '')
        content_hash = hashlib.md5(f"{title}{link}".encode()).hexdigest()
        
        entries.append({
            "title": title,
            "link": link,
            "summary": entry.get('summary', ''),
            "published": entry.get('published', ''),
            "hash": content_hash
        })
    return entries
