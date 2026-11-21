import json
import os
import re
import shutil
import sys
import unicodedata
import uuid
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen

import pandas as pd
import xlsxwriter
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path(r"C:\Users\krzys\Downloads\Cortez\Obrazy z galerii krakowskiej\katalog_zbigniew_cortez_zajac.xlsx")
IMAGES = SOURCE.parent / "przerobione"


def load_env():
    values = {}
    for name in (".env", ".env.local"):
        path = ROOT / name
        if not path.exists():
            continue
        for line in path.read_text(encoding="utf-8").splitlines():
            if "=" not in line or line.lstrip().startswith("#"):
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def normalize(value):
    text = unicodedata.normalize("NFKD", str(value)).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "", text)


def slugify(value):
    text = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"^-+|-+$", "", re.sub(r"[^a-z0-9]+", "-", text))


def request(url, key, method="GET", payload=None, content_type="application/json"):
    body = json.dumps(payload, ensure_ascii=False).encode("utf-8") if payload is not None and content_type == "application/json" else payload
    headers = {"apikey": key, "Authorization": f"Bearer {key}"}
    if content_type:
        headers["Content-Type"] = content_type
    if method in {"POST", "PATCH"} and content_type == "application/json":
        headers["Prefer"] = "return=representation"
    response = urlopen(Request(url, data=body, headers=headers, method=method), timeout=90)
    raw = response.read()
    return json.loads(raw.decode("utf-8")) if raw else None


def write_workbook(rows, statuses):
    backup = SOURCE.with_name(f"{SOURCE.stem}.before-import.xls")
    temp = SOURCE.with_name(f"{SOURCE.stem}.importing.xlsx")
    shutil.copy2(SOURCE, backup)
    book = xlsxwriter.Workbook(temp)
    sheet = book.add_worksheet("Katalog")
    headers = ["Tytuł", "Rok", "Rozmiar", "Metoda", "Cena PLN", "Dostępność", "Źródła", "Status importu", "Plik WebP"]
    header_format = book.add_format({"bold": True, "bg_color": "#1B1916", "font_color": "#FFFFFF", "border": 1})
    normal = book.add_format({"border": 1})
    skipped = book.add_format({"border": 1, "bg_color": "#FDE9E7", "font_color": "#9C0006"})
    money = book.add_format({"border": 1, "num_format": "#,##0.00"})
    sheet.write_row(0, 0, headers, header_format)
    for index, row in enumerate(rows, start=1):
        values = [row["title"], row["year"], row["size"], row["method_source"], row["price"], row["availability_source"], row["source"], statuses[index - 1][0], statuses[index - 1][1]]
        cell_format = skipped if statuses[index - 1][0].startswith("Pominięto") else normal
        for column, value in enumerate(values):
            sheet.write(index, column, value if value is not None else "", money if column == 4 and isinstance(value, (int, float)) else cell_format)
    sheet.set_column("A:A", 34)
    sheet.set_column("B:B", 10)
    sheet.set_column("C:C", 16)
    sheet.set_column("D:D", 18)
    sheet.set_column("E:E", 14)
    sheet.set_column("F:F", 14)
    sheet.set_column("G:G", 56)
    sheet.set_column("H:H", 45)
    sheet.set_column("I:I", 38)
    sheet.freeze_panes(1, 0)
    book.close()
    temp.replace(SOURCE)
    return backup


def main():
    dry_run = "--dry-run" in sys.argv
    env = load_env()
    url = env.get("NEXT_PUBLIC_SUPABASE_URL")
    key = env.get("SUPABASE_SERVICE_ROLE_KEY") or env.get("SUPABASE_SECRET_KEY")
    if not url or not key:
        raise RuntimeError("Brakuje konfiguracji Supabase z kluczem uprzywilejowanym.")

    source = pd.read_excel(SOURCE, engine="xlrd")
    columns = list(source.columns)
    image_map = {}
    for file in sorted(IMAGES.glob("*.webp")):
        base = re.sub(r"\s*--\s*\d+$", "", file.stem)
        image_map.setdefault(normalize(base), []).append(file)

    method_map = {"Oil on board": "Olej na płycie", "Oil on canvas": "Olej na płótnie"}
    availability_map = {"dostępny": "available", "sprzedany": "sold"}
    seen_titles = {}
    rows = []
    statuses = []
    for index, record in source.iterrows():
        title = str(record.iloc[0]).strip()
        title_key = normalize(title)
        duplicate_of = seen_titles.get(title_key)
        if duplicate_of is None:
            seen_titles[title_key] = index + 2
        method_source = None if pd.isna(record.iloc[3]) else str(record.iloc[3]).strip()
        availability_source = str(record.iloc[5]).strip()
        images = image_map.get(title_key, [])
        file = images[0] if images else None
        rows.append({
            "title": title,
            "year": None if pd.isna(record.iloc[1]) else str(record.iloc[1]).strip(),
            "size": None if pd.isna(record.iloc[2]) else str(record.iloc[2]).strip(),
            "method_source": method_source,
            "method": method_map.get(method_source) if method_source else None,
            "price": None if pd.isna(record.iloc[4]) else float(record.iloc[4]),
            "availability_source": availability_source,
            "availability": availability_map.get(availability_source),
            "source": None if pd.isna(record.iloc[7]) else str(record.iloc[7]).strip(),
            "file": file,
            "duplicate_of": duplicate_of,
            "row_number": index + 2,
        })
        statuses.append(("", file.name if file else ""))

    problems = [row for row in rows if not row["availability"] or not row["file"]]
    if problems:
        raise RuntimeError(f"Nie można jednoznacznie zaimportować {len(problems)} wierszy z powodu brakującej dostępności lub pliku.")
    winners = [row for row in rows if row["duplicate_of"] is None]
    skipped = [row for row in rows if row["duplicate_of"] is not None]
    if dry_run:
        print(json.dumps({"to_import": len(winners), "skipped_duplicates": len(skipped), "methods": {"null": sum(row["method"] is None for row in winners)}}, ensure_ascii=False))
        return

    existing = request(f"{url}/rest/v1/artworks?select=id,slug,title,image_id", key)
    existing_by_slug = {item["slug"]: item for item in existing}
    used_slugs = set(existing_by_slug)
    imported = 0
    updated = 0
    for order, row in enumerate(winners, start=1):
        base_slug = slugify(row["title"])
        slug = base_slug
        suffix = 2
        while slug in used_slugs and slug not in existing_by_slug:
            slug = f"{base_slug}-{suffix}"
            suffix += 1
        payload = {
            "slug": slug,
            "title": row["title"],
            "year": row["year"],
            "method": row["method"],
            "size": row["size"],
            "description": f"Źródło: {row['source']}" if row["source"] else None,
            "price_pln": row["price"],
            "availability": row["availability"],
            "author": "cortez",
            "publication_status": "published",
            "sale_mode": "none",
            "order": order,
        }
        existing_artwork = existing_by_slug.get(slug)
        if existing_artwork:
            artwork = request(f"{url}/rest/v1/artworks?id=eq.{quote(existing_artwork['id'])}", key, "PATCH", payload)[0]
            updated += 1
        else:
            artwork = request(f"{url}/rest/v1/artworks", key, "POST", payload)[0]
            existing_by_slug[slug] = artwork
            used_slugs.add(slug)
            imported += 1

        storage_path = f"artworks/{artwork['id']}/{uuid.uuid4()}-{row['file'].name}"
        binary = row["file"].read_bytes()
        request(f"{url}/storage/v1/object/portfolio/{quote(storage_path, safe='/')}", key, "POST", binary, "image/webp")
        with Image.open(row["file"]) as image:
            width, height = image.size
        media_payload = {"storage_bucket": "portfolio", "storage_path": storage_path, "role": "thumbnail", "mime_type": "image/webp", "width": width, "height": height, "byte_size": len(binary), "alt_text": row["title"], "is_public": True, "artwork_id": artwork["id"], "room_id": None, "exhibition_id": None, "sort_order": 0}
        current_media = request(f"{url}/rest/v1/media_assets?select=id,storage_bucket,storage_path&artwork_id=eq.{quote(artwork['id'])}&role=eq.thumbnail", key)
        if current_media:
            media = request(f"{url}/rest/v1/media_assets?id=eq.{quote(current_media[0]['id'])}", key, "PATCH", media_payload)[0]
            old = current_media[0]
            if old["storage_path"] != storage_path:
                request(f"{url}/storage/v1/object/{quote(old['storage_bucket'])}/{quote(old['storage_path'], safe='/')}", key, "DELETE", None, None)
        else:
            media = request(f"{url}/rest/v1/media_assets", key, "POST", media_payload)[0]
        request(f"{url}/rest/v1/artworks?id=eq.{quote(artwork['id'])}", key, "PATCH", {"image_id": media["id"]})
        statuses[row["row_number"] - 2] = ("Zaimportowano" if not existing_artwork else "Zaktualizowano istniejący rekord", row["file"].name)

    for row in skipped:
        statuses[row["row_number"] - 2] = (f"Pominięto — powtórzony tytuł; zaimportowano wiersz {row['duplicate_of']}", row["file"].name)
    backup = write_workbook(rows, statuses)
    print(json.dumps({"inserted": imported, "updated": updated, "skipped_duplicates": len(skipped), "workbook": str(SOURCE), "backup": str(backup)}, ensure_ascii=False))


if __name__ == "__main__":
    main()
