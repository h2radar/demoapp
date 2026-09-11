"""Validate and stage only the files served by GitHub Pages."""
import shutil
import sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
FILES = ('index.html', 'style.css', 'app.js', 'geometry.js', 'placement.js', 'report.js')


class AssetCheck(HTMLParser):
    def handle_starttag(self, tag, attrs):
        for name, value in attrs:
            if name not in ('src', 'href') or not value:
                continue
            url = urlsplit(value)
            if url.scheme or url.netloc or not url.path:
                continue
            if url.path.startswith('/'):
                raise ValueError(f'Asset must use a relative URL: {value}')
            if not (ROOT / url.path).is_file():
                raise FileNotFoundError(f'Missing asset: {value}')


def prepare(destination):
    AssetCheck().feed((ROOT / 'index.html').read_text())
    destination.mkdir(parents=True, exist_ok=True)
    for name in FILES:
        shutil.copy2(ROOT / name, destination / name)
    shutil.copytree(ROOT / 'assets', destination / 'assets', dirs_exist_ok=True)
    (destination / '.nojekyll').touch()
    print(f'Validated and staged {len(FILES)} app files plus assets in {destination}')


if __name__ == '__main__':
    prepare(Path(sys.argv[1]))
