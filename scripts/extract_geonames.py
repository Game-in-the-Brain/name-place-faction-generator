#!/usr/bin/env python3
"""
Extract place names and alternate names from GeoNames allCountries.txt
for use in LC bootstrapping.

Output: JSON files per country code with place name frequencies.
"""

import json
import sys
from collections import Counter
from pathlib import Path

GEONAMES_PATH = Path("data-raw/geonames/allCountries.txt")
OUTPUT_DIR = Path("data-raw/geonames_extracted")

# Country code → LC mapping (bootstrap set)
COUNTRY_TO_LC = {
    "US": "en-us",
    "GB": "en-gb",
    "IE": "en-ie",
    "AU": "en-au",
    "CA": "en-ca",
    "JP": "ja-jp",
    "CN": "zh-cn",
    "TW": "zh-tw",
    "KR": "ko-kr",
    "ES": "es-es",
    "MX": "es-mx",
    "FR": "fr-fr",
    "DE": "de-de",
    "IT": "it-it",
    "RU": "ru-ru",
    "SA": "ar-sa",
    "EG": "ar-eg",
    "IN": "hi-in",
    "PH": "tl-ph",
    "SE": "sv-se",
    "NO": "no-no",
    "FI": "fi-fi",
    "PL": "pl-pl",
    "NL": "nl-nl",
}

# Feature classes to include: P = populated place, A = admin division
FEATURE_CLASSES = {"P", "A"}


def extract_names():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    counters: dict[str, Counter] = {lc: Counter() for lc in set(COUNTRY_TO_LC.values())}

    print(f"Reading {GEONAMES_PATH} ...")
    line_count = 0
    with open(GEONAMES_PATH, "r", encoding="utf-8") as f:
        for line in f:
            line_count += 1
            if line_count % 500_000 == 0:
                print(f"  processed {line_count:,} lines")

            parts = line.strip().split("\t")
            if len(parts) < 19:
                continue

            # Columns: 0=geonameid, 1=name, 2=asciiname, 3=alternatenames, 4=lat, 5=lon,
            # 6=feature class, 7=feature code, 8=country code, ...
            name = parts[1]
            ascii_name = parts[2]
            alternate_names = parts[3]
            feature_class = parts[6]
            country_code = parts[8]

            if feature_class not in FEATURE_CLASSES:
                continue

            lc = COUNTRY_TO_LC.get(country_code)
            if not lc:
                continue

            # Add primary name
            if ascii_name and ascii_name != name:
                counters[lc][ascii_name] += 1
            elif name and name.isascii():
                counters[lc][name] += 1

            # Add alternate names
            if alternate_names:
                for alt in alternate_names.split(","):
                    alt = alt.strip()
                    if alt and alt.isascii() and len(alt) > 1:
                        counters[lc][alt] += 1

    print(f"Done. Total lines: {line_count:,}")

    for lc, counter in counters.items():
        out_path = OUTPUT_DIR / f"{lc}_places.json"
        # Keep top 5000 most frequent
        top = counter.most_common(5000)
        data = {
            "lc": lc,
            "source": "geonames",
            "place_names": [{"name": name, "count": count} for name, count in top],
        }
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        print(f"  Wrote {len(top)} names to {out_path}")


if __name__ == "__main__":
    extract_names()
