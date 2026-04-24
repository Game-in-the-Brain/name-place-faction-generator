#!/usr/bin/env python3
"""
Extract English pronunciations from CMUDict and convert ARPABET to IPA.
Output: JSON with name → IPA mappings for bootstrap en-* LCs.
"""

import json
import re
from pathlib import Path

CMUDICT_PATH = Path("data-raw/cmudict/cmudict-0.7b")
OUTPUT_PATH = Path("data-raw/cmudict_extracted/en_pronunciations.json")

# ARPABET → IPA mapping (simplified, covers most common cases)
ARPABET_TO_IPA = {
    "AA": "ɑ", "AA0": "ɑ", "AA1": "ɑ", "AA2": "ɑ",
    "AE": "æ", "AE0": "æ", "AE1": "æ", "AE2": "æ",
    "AH": "ʌ", "AH0": "ə", "AH1": "ʌ", "AH2": "ʌ",
    "AO": "ɔ", "AO0": "ɔ", "AO1": "ɔ", "AO2": "ɔ",
    "AW": "aʊ", "AW0": "aʊ", "AW1": "aʊ", "AW2": "aʊ",
    "AY": "aɪ", "AY0": "aɪ", "AY1": "aɪ", "AY2": "aɪ",
    "B": "b",
    "CH": "tʃ",
    "D": "d",
    "DH": "ð",
    "EH": "ɛ", "EH0": "ɛ", "EH1": "ɛ", "EH2": "ɛ",
    "ER": "ɜr", "ER0": "ɚ", "ER1": "ɜr", "ER2": "ɜr",
    "EY": "eɪ", "EY0": "eɪ", "EY1": "eɪ", "EY2": "eɪ",
    "F": "f",
    "G": "ɡ",
    "HH": "h",
    "IH": "ɪ", "IH0": "ɪ", "IH1": "ɪ", "IH2": "ɪ",
    "IY": "i", "IY0": "i", "IY1": "i", "IY2": "i",
    "JH": "dʒ",
    "K": "k",
    "L": "l",
    "M": "m",
    "N": "n",
    "NG": "ŋ",
    "OW": "oʊ", "OW0": "oʊ", "OW1": "oʊ", "OW2": "oʊ",
    "OY": "ɔɪ", "OY0": "ɔɪ", "OY1": "ɔɪ", "OY2": "ɔɪ",
    "P": "p",
    "R": "r",
    "S": "s",
    "SH": "ʃ",
    "T": "t",
    "TH": "θ",
    "UH": "ʊ", "UH0": "ʊ", "UH1": "ʊ", "UH2": "ʊ",
    "UW": "u", "UW0": "u", "UW1": "u", "UW2": "u",
    "V": "v",
    "W": "w",
    "Y": "j",
    "Z": "z",
    "ZH": "ʒ",
}


def arpabet_to_ipa(phones: list[str]) -> str:
    """Convert ARPABET phone list to approximate IPA string."""
    ipa_chars = []
    for phone in phones:
        # Strip stress digits for lookup if exact match fails
        ipa = ARPABET_TO_IPA.get(phone)
        if not ipa:
            base = re.sub(r"\d$", "", phone)
            ipa = ARPABET_TO_IPA.get(base, "")
        ipa_chars.append(ipa)
    return "/" + "".join(ipa_chars) + "/"


def extract():
    pronunciations = {}
    print(f"Reading {CMUDICT_PATH} ...")

    with open(CMUDICT_PATH, "r", encoding="latin-1") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith(";;;"):
                continue
            parts = line.split()
            if len(parts) < 2:
                continue
            word = parts[0].lower()
            phones = parts[1:]

            # Clean up word: remove parentheticals like (2), (3)
            word = re.sub(r"\(\d+\)$", "", word)

            # Only keep single words (no phrases), alphabetic
            if not word.isalpha() or len(word) < 2:
                continue

            # Capitalize first letter
            word = word[0].upper() + word[1:]

            ipa = arpabet_to_ipa(phones)
            # Only store if not already present (first pronunciation wins)
            if word not in pronunciations:
                pronunciations[word] = ipa

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(pronunciations, f, ensure_ascii=False, indent=2)

    print(f"Extracted {len(pronunciations)} pronunciations to {OUTPUT_PATH}")


if __name__ == "__main__":
    extract()
