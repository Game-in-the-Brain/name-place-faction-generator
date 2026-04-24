#!/usr/bin/env python3
"""
Build bootstrap LC JSON files from extracted GeoNames and CMUDict data.

Creates packages/namegen/data/lc/*.json and packages/placegen/data/lc/*.json
with enough content for functional name generation.
"""

import json
import random
from pathlib import Path

# Paths
GEONAMES_DIR = Path("data-raw/geonames_extracted")
CMUDICT_PATH = Path("data-raw/cmudict_extracted/en_pronunciations.json")
NAMEGEN_LC_DIR = Path("packages/namegen/data/lc")
PLACEGEN_LC_DIR = Path("packages/placegen/data/lc")
SHARED_DATA_DIR = Path("shared/data")

NAMEGEN_LC_DIR.mkdir(parents=True, exist_ok=True)
PLACEGEN_LC_DIR.mkdir(parents=True, exist_ok=True)
SHARED_DATA_DIR.mkdir(parents=True, exist_ok=True)

# Load CMUDict pronunciations
with open(CMUDICT_PATH, "r", encoding="utf-8") as f:
    cmudict = json.load(f)

# Bootstrap given/family name seeds per LC
# For English LCs we have CMUDict IPA. For others we use well-known names.
BOOTSTRAP_NAMES = {
    "en-us": {
        "given": {
            "M": ["James", "John", "Robert", "Michael", "William", "David", "Joseph", "Thomas", "Charles", "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Kenneth", "Joshua", "Kevin", "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary", "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel", "Gregory", "Frank", "Alexander", "Raymond", "Patrick", "Jack", "Dennis", "Jerry", "Tyler", "Aaron"],
            "F": ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen", "Nancy", "Lisa", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle", "Dorothy", "Carol", "Amanda", "Melissa", "Deborah", "Stephanie", "Rebecca", "Laura", "Sharon", "Cynthia", "Kathleen", "Amy", "Shirley", "Angela", "Helen", "Anna", "Brenda", "Pamela", "Nicole", "Emma", "Samantha", "Katherine", "Christine", "Debra", "Rachel", "Catherine", "Carolyn", "Janet", "Ruth", "Maria"],
        },
        "family": ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin", "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson", "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores", "Green", "Adams", "Nelson", "Baker", "Hall", "Rivera", "Campbell", "Mitchell", "Carter", "Roberts"],
    },
    "en-gb": {
        "given": {
            "M": ["Oliver", "George", "Harry", "Noah", "Jack", "Leo", "Arthur", "Muhammad", "Oscar", "Charlie", "James", "William", "Lucas", "Henry", "Thomas", "Freddie", "Alfie", "Theo", "Alexander", "Edward", "Max", "Archie", "Joshua", "Joseph", "Adam", "Logan", "Finley", "Ethan", "Mason", "Jacob", "Harrison", "Theodore", "Daniel", "Tommy", "Arlo", "Sebastian", "Jake", "Toby", "Jayden", "Liam"],
            "F": ["Olivia", "Amelia", "Isla", "Ava", "Mia", "Lily", "Sophia", "Grace", "Freya", "Emily", "Willow", "Florence", "Ella", "Rosie", "Isabella", "Daisy", "Sienna", "Poppy", "Elsie", "Eva", "Harper", "Mila", "Chloe", "Ivy", "Alice", "Ruby", "Phoebe", "Sofia", "Evie", "Millie", "Layla", "Matilda", "Ayla", "Maisie", "Esme", "Erin", "Luna", "Eliza", "Rose", "Maeve"],
        },
        "family": ["Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Johnson", "Davies", "Robinson", "Wright", "Thompson", "Evans", "Walker", "White", "Roberts", "Green", "Hall", "Wood", "Jackson", "Clarke", "Patel", "Thomas", "Harris", "Lewis", "Martin", "Hill", "Armstrong", "Young", "Robinson", "Ward", "Turner", "Phillips", "Mitchell", "Carter", "Anderson", "Miller", "Moore", "Martin", "Lee", "King"],
    },
    "en-ie": {
        "given": {
            "M": ["Jack", "James", "Noah", "Daniel", "Conor", "Finn", "Liam", "Fionn", "Harry", "Charlie", "Oisin", "Michael", "Thomas", "Cillian", "Patrick", "Rian", "Darragh", "Sean", "Adam", "Alex", "Luke", "Max", "Ryan", "Oliver", "Cian", "Tadhg", "Oscar", "Bobby", "Callum", "Dylan", "Ethan", "Lucas", "Matthew", "Aaron", "Samuel", "Ben", "Leon", "Jake", "Theo", "Senan"],
            "F": ["Emily", "Grace", "Fiadh", "Sophie", "Ava", "Amelia", "Ella", "Hannah", "Lucy", "Mia", "Lily", "Emma", "Chloe", "Caoimhe", "Sophia", "Molly", "Olivia", "Anna", "Aoife", "Robyn", "Saoirse", "Kate", "Ruby", "Isla", "Zoe", "Lauren", "Erin", "Freya", "Alice", "Holly", "Sarah", "Jessica", "Katie", "Sadie", "Niamh", "Evie", "Clara", "Roisin", "Maya", "Ada"],
        },
        "family": ["Murphy", "Kelly", "O'Brien", "Byrne", "Ryan", "O'Connor", "Walsh", "O'Sullivan", "McCarthy", "Doyle", "Kavanagh", "Gallagher", "Dunne", "Brennan", "Burke", "Collins", "Campbell", "Clarke", "Doherty", "Fitzgerald", "Murray", "Quinn", "Moore", "McLoughlin", "Higgins", "Whelan", "Carey", "Kennedy", "Power", "Lynch", "Daly", "Maguire", "Reilly", "O'Neill", "Brady", "Hayes", "Flynn", "O'Donnell", "Nolan", "Maher"],
    },
    "ja-jp": {
        "given": {
            "M": ["Haruto", "Sota", "Yuto", "Yuki", "Hayato", "Haruki", "Riku", "Koki", "Sora", "Sosuke", "Ren", "Minato", "Itsuki", "Takumi", "Hinata", "Tomohiro", "Yusei", "Shotaro", "Ryota", "Kaito", "Asahi", "Tatsuki", "Keita", "Tsubasa", "Reo", "Yuito", "Kosei", "Kanata", "Ryusei", "Takuya", "Yuta", "Shota", "Kazuki", "Daiki", "Masato", "Sho", "Takashi", "Yoshiki", "Satoshi", "Hiroshi"],
            "F": ["Yui", "Rio", "Yuna", "Hina", "Koharu", "Akari", "Saki", "Mei", "Mio", "Honoka", "Sakura", "Ichika", "Aoi", "Rin", "Tsumugi", "Sana", "Nanami", "Miku", "Yuka", "Riko", "Kanna", "Miyu", "Kokona", "Haruka", "Yuna", "Ayaka", "Nana", "Risa", "Moeka", "Yume", "Mao", "Kanon", "Hiyori", "Kasumi", "Rena", "Yuzuki", "Hinako", "Nozomi", "Yurika", "Misa"],
        },
        "family": ["Sato", "Suzuki", "Takahashi", "Tanaka", "Watanabe", "Ito", "Yamamoto", "Nakamura", "Kobayashi", "Yoshida", "Yamada", "Sasaki", "Yamaguchi", "Matsumoto", "Inoue", "Kimura", "Hayashi", "Shimizu", "Yamazaki", "Ikeda", "Abe", "Hashimoto", "Yamashita", "Ishikawa", "Nakajima", "Maeda", "Fujita", "Ogawa", "Goto", "Hasegawa", "Murakami", "Kondo", "Ishii", "Saito", "Sakamoto", "Endo", "Aoki", "Fujii", "Nishimura", "Fukuda"],
    },
    "es-es": {
        "given": {
            "M": ["Hugo", "Martin", "Lucas", "Mateo", "Leo", "Daniel", "Alejandro", "Pablo", "Manuel", "Alvaro", "Adrian", "Mario", "Diego", "Oliver", "Marcos", "Thiago", "Antonio", "Marc", "Carlos", "Angel", "Miguel", "Gonzalo", "Bruno", "David", "Javier", "Marco", "Izan", "Juan", "Sergio", "Enzo", "Dylan", "Alex", "Nicolas", "Victor", "Hector", "Jorge", "Eric", "Raul", "Iker", "Ruben"],
            "F": ["Lucia", "Sofia", "Martina", "Maria", "Julia", "Paula", "Valeria", "Emma", "Daniela", "Carla", "Alma", "Olivia", "Sara", "Carmen", "Vega", "Alba", "Aitana", "Noa", "Lola", "Chloe", "Mia", "Claudia", "Valentina", "Laia", "Jimena", "Ariadna", "Ainara", "Marina", "Triana", "Vera", "Candela", "Lara", "Elena", "Nora", "Ines", "Blanca", "Alicia", "Carlota", "Rocio", "Ainhoa"],
        },
        "family": ["Garcia", "Rodriguez", "Gonzalez", "Fernandez", "Lopez", "Martinez", "Sanchez", "Perez", "Gomez", "Martin", "Jimenez", "Ruiz", "Hernandez", "Diaz", "Moreno", "Alvarez", "Romero", "Alonso", "Gutierrez", "Navarro", "Torres", "Dominguez", "Vazquez", "Ramos", "Gil", "Ramirez", "Serrano", "Blanco", "Molina", "Morales", "Suarez", "Ortega", "Delgado", "Castro", "Ortiz", "Rubio", "Marin", "Sanz", "Nuñez", "Medina"],
    },
    "de-de": {
        "given": {
            "M": ["Noah", "Matteo", "Elias", "Leon", "Paul", "Emil", "Finn", "Felix", "Lukas", "Theo", "Henry", "Ben", "Jonas", "Maximilian", "Liam", "Luca", "Oskar", "Anton", "Max", "Levi", "Moritz", "Julian", "Jakob", "Niklas", "Tim", "David", "Alexander", "Samuel", "Philipp", "Tom", "Florian", "Erik", "Rafael", "Jonathan", "Fabian", "Linus", "Jan", "Simon", "Joshua", "Nico"],
            "F": ["Emilia", "Ella", "Mia", "Sophia", "Lina", "Mila", "Lea", "Clara", "Anna", "Leni", "Emma", "Lia", "Hannah", "Lena", "Marie", "Nele", "Johanna", "Lara", "Charlotte", "Sarah", "Paula", "Maja", "Ida", "Luisa", "Finja", "Juna", "Lilly", "Thea", "Frieda", "Elisa", "Amy", "Amelie", "Maya", "Helena", "Mathilda", "Lisa", "Victoria", "Isabella", "Marlene", "Elina"],
        },
        "family": ["Mueller", "Schmidt", "Schneider", "Fischer", "Weber", "Meyer", "Wagner", "Becker", "Schulz", "Hoffmann", "Koch", "Bauer", "Richter", "Klein", "Wolf", "Schroeder", "Neumann", "Schwarz", "Zimmermann", "Braun", "Krueger", "Hofmann", "Hartmann", "Lange", "Schmitt", "Werner", "Schmitz", "Krause", "Meier", "Lehmann", "Koehler", "Maier", "Herrmann", "Koenig", "Walter", "Mayer", "Huber", "Kaiser", "Fuchs", "Peters"],
    },
    "fr-fr": {
        "given": {
            "M": ["Gabriel", "Leo", "Raphael", "Arthur", "Louis", "Jules", "Adam", "Mael", "Lucas", "Hugo", "Noah", "Nathan", "Aaron", "Sacha", "Paul", "Mohamed", "Ethan", "Tom", "Noe", "Victor", "Martin", "Timothee", "Nolan", "Marius", "Mathis", "Theo", "Enzo", "Eden", "Maxime", "Yanis", "Eliott", "Baptiste", "Axel", "Evan", "Mathys", "Samuel", "Ibrahim", "Alexandre", "Maxence", "Gabin"],
            "F": ["Jade", "Louise", "Emma", "Ambre", "Alice", "Rose", "Anna", "Alba", "Romy", "Mia", "Lina", "Julia", "Chloe", "Alma", "Agathe", "Iris", "Juliette", "Inaya", "Louna", "Valentina", "Lyna", "Mila", "Zoe", "Lea", "Jeanne", "Eva", "Nour", "Lola", "Charlie", "Victoria", "Luna", "Olivia", "Adèle", "Sarah", "Lucie", "Lana", "Sofia", "Mya", "Lya", "Clemence"],
        },
        "family": ["Martin", "Bernard", "Thomas", "Petit", "Robert", "Richard", "Durand", "Dubois", "Moreau", "Laurent", "Simon", "Michel", "Lefebvre", "Leroy", "Roux", "David", "Bertrand", "Morel", "Fournier", "Girard", "Bonnet", "Dupont", "Lambert", "Francois", "Martinez", "Legrand", "Garnier", "Faure", "Rousseau", "Vincent", "Muller", "Lefranc", "Mercier", "Dupuy", "Levy", "Clement", "Morin", "Marchand", "Duval", "Brunet"],
    },
    "zh-cn": {
        "given": {
            "M": ["Wei", "Hao", "Yi", "Jun", "Feng", "Yong", "Jie", "Qiang", "Lei", "Bo", "Peng", "Ming", "Chao", "Jian", "Tao", "Wen", "Hui", "Dong", "Yang", "Bin", "Xin", "Zhi", "Long", "Cheng", "Kai", "Jia", "Hua", "Rui", "Xiang", "De", "Zhen", "Guo", "Lin", "Xu", "Zhou", "An", "Sheng", "Zhuo", "Tian", "Yuan"],
            "F": ["Ying", "Hua", "Fang", "Min", "Na", "Jing", "Yan", "Li", "Xiu", "Qing", "Lan", "Mei", "Ling", "Xia", "Rong", "Gui", "Qiong", "Shu", "Zhi", "Ping", "Hong", "Wei", "Ting", "Juan", "Xin", "Xue", "Lian", "Shan", "Xiang", "Yu", "Jin", "Yao", "Yun", "Qian", "Su", "Ning", "Lu", "Rui", "Qin", "Bi"],
        },
        "family": ["Wang", "Li", "Zhang", "Liu", "Chen", "Yang", "Huang", "Zhao", "Wu", "Zhou", "Xu", "Sun", "Ma", "Zhu", "Hu", "Guo", "He", "Gao", "Lin", "Luo", "Zheng", "Liang", "Xie", "Song", "Tang", "Xu", "Han", "Feng", "Deng", "Cao", "Peng", "Zeng", "Xiao", "Tian", "Dong", "Yuan", "Pan", "Yu", "Jiang", "Cai"],
    },
    "ar-sa": {
        "given": {
            "M": ["Mohammed", "Ahmed", "Ali", "Omar", "Yousef", "Abdullah", "Khalid", "Fahd", "Saud", "Faisal", "Salman", "Nasser", "Turki", "Bandar", "Mishaal", "Mansour", "Talal", "Nawaf", "Abdulaziz", "Ibrahim", "Hamad", "Saad", "Badr", "Majed", "Sultan", "Hamed", "Rashid", "Hassan", "Jamil", "Zayed", "Mubarak", "Thani", "Jassim", "Tamim", "Khalifa", "Hamdan", "Tariq", "Mahmoud", "Adel", "Waleed"],
            "F": ["Fatima", "Aisha", "Maryam", "Sarah", "Noor", "Reem", "Huda", "Mona", "Layla", "Noura", "Rania", "Lina", "Dana", "Amal", "Hana", "Salma", "Samar", "Rasha", "Maha", "Wafa", "Bushra", "Iman", "Aya", "Ghada", "Nada", "Fadwa", "Khadija", "Sana", "Zahra", "Rabab", "Samira", "Nawal", "Ferial", "Mervat", "Ola", "Heba", "Dina", "Shaima", "Yasmin", "Manal"],
        },
        "family": ["Al-Rashid", "Al-Saud", "Al-Faisal", "Al-Thani", "Al-Nahyan", "Al-Maktoum", "Al-Khalifa", "Al-Sabah", "Al-Hashemi", "Al-Harbi", "Al-Qahtani", "Al-Otaibi", "Al-Dosari", "Al-Mutairi", "Al-Shammari", "Al-Omari", "Al-Zahrani", "Al-Shahrani", "Al-Bishi", "Al-Qurashi", "Al-Ahmadi", "Al-Baloushi", "Al-Mansouri", "Al-Marri", "Al-Kaabi", "Al-Suwaidi", "Al-Mazrouei", "Al-Hammadi", "Al-Nuaimi", "Al-Ali", "Al-Ketbi", "Al-Dhaheri", "Al-Zaabi", "Al-Shamsi", "Al-Rumaithi", "Al-Darmaki", "Al-Muhairi", "Al-Mehairi", "Al-Rashedi", "Al-Mazroui"],
    },
}

# Place word categories with seed words per culture (bootstrap)
PLACE_WORD_SEEDS = {
    "en-us": {
        "terrain": ["field", "brook", "ridge", "valley", "lake", "ford", "glen", "dale", "hollow", "creek", "mountain", "plain", "desert", "marsh", "cove", "bay", "spring", "falls", "peak", "pass"],
        "direction": ["north", "south", "east", "west", "upper", "lower", "new", "old", "far", "near", "inner", "outer"],
        "quality": ["green", "white", "black", "red", "blue", "great", "little", "grand", "clear", "dark", "bright", "cold", "warm", "dry", "wet"],
        "flora": ["oak", "pine", "maple", "cedar", "willow", "elm", "birch", "cypress", "juniper", "hawthorn"],
        "fauna": ["wolf", "bear", "eagle", "hawk", "deer", "fox", "elk", "bison", "raven", "crow"],
        "structure": ["fort", "town", "city", "port", "ville", "burg", "ton", "ham", "wich", "stead", "bridge", "gate", "mill", "station"],
        "sacred": ["holy", "saint", "cross", "temple", "shrine", "grace", "mercy", "peace", "hope", "faith"],
        "event": ["battle", "founding", "union", "liberty", "independence", "victory", "storm", "flood", "fire", "gold"],
        "proper_root": ["wash", "mont", "san", "santa", "los", "las", "bel", "beau", "van", "von"],
    },
    "en-gb": {
        "terrain": ["moor", "heath", "down", "dale", "fen", "mere", "beck", "wold", "carr", "ness", "loch", "strath", "glen", "burgh", "tor", "combe", "leigh", "hay"],
        "direction": ["north", "south", "east", "west", "upper", "lower", "over", "under", "mid", "nether"],
        "quality": ["great", "little", "broad", "long", "high", "deep", "old", "new", "fair", "dark"],
        "flora": ["oak", "ash", "elm", "yew", "thorn", "hazel", "birch", "willow", "hawthorn", "holly"],
        "fauna": ["swan", "stag", "hart", "wolf", "fox", "crow", "raven", "otter", "badger", "hare"],
        "structure": ["chester", "caster", "cester", "wich", "wick", "burgh", "brough", "borough", "ham", "ton", "by", "thorpe", "ford", "port"],
        "sacred": ["holy", "saint", "kirk", "minster", "abbey", "priory", "cross", "blessed"],
        "event": ["battle", "moot", "treow", "wic", "ford", "bridge", "gate"],
        "proper_root": ["avon", "exe", "trent", "ouse", "tyne", "tees", "wye", "nene"],
    },
    "en-ie": {
        "terrain": ["bally", "kil", "knock", "drum", "carrick", "glen", "inch", "lough", "more", "ard", "carn", "clon", "dun", "fern", "inver", "magh", "mona", "rath", "ros", "skea"],
        "direction": ["north", "south", "east", "west", "upper", "lower"],
        "quality": ["black", "white", "green", "red", "grey", "great", "little", "old"],
        "flora": ["ash", "oak", "birch", "hawthorn", "hazel", "holly", "yew", "furze", "heather"],
        "fauna": ["deer", "hart", "fox", "wolf", "badger", "otter", "seal", "salmon", "trout"],
        "structure": ["fort", "abbey", "castle", "hall", "manor", "mill", "bridge", "quay", "harbour"],
        "sacred": ["holy", "saint", "blessed", "sacred", "divine", "grace"],
        "event": ["battle", "cove", "haven", "port", "harbour"],
        "proper_root": ["bally", "kil", "knock", "drum", "carrick", "glen", "lough", "more", "ard", "dun"],
    },
    "ja-jp": {
        "terrain": ["yama", "sawa", "hara", "no", "gawa", "mura", "machi", "to", "shima", "zaki", "saki", "hama", "ura", "ko", "ike", "numa", "tani", "oka", "take", "mine"],
        "direction": ["kita", "minami", "higashi", "nishi", "naka", "ue", "shita", "omote", "ura", "shin"],
        "quality": ["shiro", "kuro", "aka", "ao", "oo", "koa", "furu", "shin", "haru", "natsu"],
        "flora": ["sakura", "matsu", "take", "kaede", "kiri", "ume", "momo", "yanagi", "kiku", "take"],
        "fauna": ["taka", "washi", "tsuru", "koi", "sakana", "tori", "inu", "shika", "kuma", "kitsune"],
        "structure": ["jo", "shi", "cho", "ku", "gun", "ken", "to", "fu", "do", "in", "ji", "sha", "kan"],
        "sacred": ["kami", "rei", "sei", "shin", "myo", "butsu", "zen", "rin"],
        "event": ["heiwa", "shori", "kessen", "kakumei", "saigai"],
        "proper_root": ["fuji", "toyo", "hima", "hoku", "tohoku", "kanto", "kansai", "chubu", "kyushu", "shikoku"],
    },
    "es-es": {
        "terrain": ["monte", "rio", "lago", "valle", "sierra", "costa", "playa", "puerto", "cabo", "punta", "isla", "llano", "meseta", "cañada", "barranco", "charca", "manantial", "cueva", "duna", "pradera"],
        "direction": ["norte", "sur", "este", "oeste", "alto", "bajo", "nuevo", "viejo", "gran", "san"],
        "quality": ["blanco", "negro", "rojo", "verde", "azul", "gran", "alto", "bajo", "nuevo", "viejo", "bueno", "santo"],
        "flora": ["roble", "pino", "olivo", "naranjo", "limonero", "palmera", "cipres", "madroño", "encina", "alamo"],
        "fauna": ["lobo", "oso", "aguila", "toro", "ciervo", "jabali", "zorro", "liebre", "buho", "halcon"],
        "structure": ["puerto", "fuerte", "castillo", "torre", "puente", "ermita", "iglesia", "villa", "ciudad", "pueblo"],
        "sacred": ["santo", "santa", "san", "cruz", "pilar", "carmen", "merced", "gracia", "paz", "luz"],
        "event": ["batalla", "victoria", "paz", "union", "descubrimiento", "fundacion"],
        "proper_root": ["al", "el", "la", "los", "las", "san", "santa", "don", "donia"],
    },
    "de-de": {
        "terrain": ["berg", "tal", "wald", "feld", "see", "fluss", "quelle", "hugel", "insel", "kuste", "bucht", "hafen", "moor", "sumpf", "steppe", "wuste", "klippe", "schlucht", "grube", "senke"],
        "direction": ["nord", "sud", "ost", "west", "oben", "unten", "vorder", "hinter", "mittel", "neu", "alt", "gross", "klein"],
        "quality": ["weiss", "schwarz", "rot", "grun", "blau", "gross", "klein", "alt", "neu", "hoch", "tief", "hell", "dunkel", "klar"],
        "flora": ["eiche", "kiefer", "fichte", "buche", "birke", "weide", "linde", "erle", "ahorn", "hasel"],
        "fauna": ["wolf", "bar", "hirsch", "fuchs", "dachs", "adler", "falke", "schwan", "reh", "wild"],
        "structure": ["burg", "stadt", "dorf", "hafen", "tor", "brucke", "mühle", "schloss", "kloster", "kirche"],
        "sacred": ["heil", "sankt", "kreuz", "gnade", "frieden", "hoffnung", "glaube", "liebe"],
        "event": ["schlacht", "frieden", "sieg", "brand", "uberschwemmung", "sturm"],
        "proper_root": ["bad", "ober", "unter", "neu", "alt", "berg", "bach", "stein", "wald"],
    },
    "fr-fr": {
        "terrain": ["mont", "val", "bois", "champ", "lac", "riviere", "source", "colline", "ile", "cote", "baie", "port", "marais", "lande", "grotte", "dune", "prairie", "vallee", "coteau", "falaise"],
        "direction": ["nord", "sud", "est", "ouest", "haut", "bas", "nouveau", "vieux", "grand", "petit"],
        "quality": ["blanc", "noir", "rouge", "vert", "bleu", "grand", "petit", "vieux", "neuf", "beau", "belle", "bon", "haut", "bas"],
        "flora": ["chene", "pin", "sapin", "hetre", "bouleau", "saule", "orme", "tilleul", "marronnier", "peuplier"],
        "fauna": ["loup", "ours", "aigle", "cerf", "renard", "lievre", "sanglier", "boeuf", "cheval", "mouton"],
        "structure": ["ville", "bourg", "chateau", "fort", "tour", "pont", "porte", "moulin", "eglise", "abbaye"],
        "sacred": ["saint", "sainte", "croix", "grace", "paix", "esperance", "foi", "notre"],
        "event": ["bataille", "victoire", "paix", "union", "decouverte", "fondation"],
        "proper_root": ["ville", "mont", "fort", "port", "bourg", "champ", "bois", "val", "mer", "lac"],
    },
    "zh-cn": {
        "terrain": ["shan", "chuan", "hu", "he", "dao", "wan", "gang", "ling", "yuan", "ping", "gao", "di", "po", "gu", "xia", "zhou", "tan", "quan", "jing", "qu"],
        "direction": ["dong", "xi", "nan", "bei", "zhong", "shang", "xia", "qian", "hou", "zuo", "you", "nei", "wai"],
        "quality": ["da", "xiao", "lao", "xin", "gao", "chang", "duan", "kuan", "zhai", "shen", "qian", "yuan", "jin"],
        "flora": ["song", "bai", "yang", "liu", "tao", "li", "mei", "zhu", "he", "lan"],
        "fauna": ["long", "feng", "hu", "shi", "xiong", "lang", "lu", "he", "ying", "yan"],
        "structure": ["cheng", "zhen", "cun", "bao", "guan", "kou", "gang", "zhan", "suo", "chang"],
        "sacred": ["sheng", "fu", "de", "an", "ning", "he", "ping", "ji", "xiang", "rui"],
        "event": ["zhan", "sheng", "he", "jian", "fa", "xian", "tong", "yi"],
        "proper_root": ["bei", "nan", "xi", "dong", "zhong", "shang", "chang", "an", "ning", "he"],
    },
    "ar-sa": {
        "terrain": ["jabal", "wadi", "bahr", "jazira", "sahra", "khalij", "shati", "nahr", "buhayra", "sahil", "hadaba", "wat", "qar", "raml", "tilal", "ghadir", "ain", "nufa", "faqra", "sahm"],
        "direction": ["shamal", "janub", "sharq", "gharb", "aala", "sufla", "qadim", "jadid", "wasat"],
        "quality": ["abyad", "aswad", "ahmar", "akhdar", "azraq", "kabeer", "sagheer", "qadeem", "jadeed", "aliy", "wadi"],
        "flora": ["nakhla", "sindian", "arz", "zaytoon", "laymoon", "naranj", "sawsan", "ward", "yasmin", "banafsaj"],
        "fauna": ["asad", "thab", "nasr", "hayya", "zalaf", "jamal", "ghazal", "kalb", "hirr", "faras"],
        "structure": ["qasr", "hisn", "madina", "qarya", "markaz", "jami", "masjid", "souq", "mazar", "manzil"],
        "sacred": ["qiddis", "noor", "baraka", "salam", "rahma", "hikma", "haq", "iman"],
        "event": ["maaraka", "fath", "salam", "ittihad", "kashf", "tasis"],
        "proper_root": ["al", "abu", "ibn", "bin", "bint", "umm", "dar", "bayt", "qasr"],
    },
}

# Default templates (can be overridden per LC)
DEFAULT_TEMPLATES = [
    {"template": ["terrain"], "weight": 2, "separator": "", "example": "Yama"},
    {"template": ["quality", "terrain"], "weight": 5, "separator": "", "example": "Blackmoor"},
    {"template": ["proper_root", "terrain"], "weight": 4, "separator": "", "example": "Chesterford"},
    {"template": ["fauna", "terrain"], "weight": 3, "separator": "", "example": "Wolverhampton"},
    {"template": ["proper_root"], "weight": 3, "separator": "", "example": "London"},
    {"template": ["direction", "terrain"], "weight": 3, "separator": "", "example": "Northfield"},
    {"template": ["event", "structure"], "weight": 2, "separator": "", "example": "Battleford"},
    {"template": ["flora", "terrain"], "weight": 2, "separator": "", "example": "Oakwood"},
    {"template": ["sacred", "terrain"], "weight": 2, "separator": "", "example": "Holywell"},
    {"template": ["quality", "flora"], "weight": 1, "separator": "", "example": "Greenoak"},
]

# Star system templates (shorter, more abstract)
STAR_SYSTEM_TEMPLATES = [
    {"template": ["proper_root"], "weight": 4, "separator": "", "example": "Carbinter"},
    {"template": ["terrain"], "weight": 3, "separator": "", "example": "Dale"},
    {"template": ["proper_root", "proper_root"], "weight": 2, "separator": "", "example": "Krasnikov"},
    {"template": ["quality", "proper_root"], "weight": 1, "separator": "", "example": "Grandor"},
]


def load_geonames(lc: str):
    path = GEONAMES_DIR / f"{lc}_places.json"
    if not path.exists():
        return []
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    return [entry["name"] for entry in data.get("place_names", [])]


def build_lc_json(lc: str, label: str, language: str, culture: str):
    print(f"Building {lc} ...")

    # 1. Names
    name_seed = BOOTSTRAP_NAMES.get(lc, BOOTSTRAP_NAMES["en-us"])
    given_names = []
    family_names = []

    for gender in ["M", "F"]:
        for name in name_seed["given"].get(gender, []):
            ipa = cmudict.get(name, "")
            # If no CMUDict IPA, use a placeholder
            if not ipa:
                ipa = f"/{name.lower()}/"
            given_names.append({
                "name": name,
                "ipa": ipa,
                "gender": gender,
                "type": "given",
                "frequency": round(random.uniform(0.3, 1.0), 2)
            })

    for name in name_seed["family"]:
        ipa = cmudict.get(name, "")
        if not ipa:
            ipa = f"/{name.lower()}/"
        family_names.append({
            "name": name,
            "ipa": ipa,
            "gender": "N",
            "type": "family",
            "frequency": round(random.uniform(0.3, 1.0), 2)
        })

    # 2. Place words
    place_word_seeds = PLACE_WORD_SEEDS.get(lc, PLACE_WORD_SEEDS["en-us"])
    geonames_list = load_geonames(lc)

    place_words = []
    for category, words in place_word_seeds.items():
        for word in words:
            ipa = cmudict.get(word.capitalize(), "")
            if not ipa:
                # Try lowercase
                ipa = cmudict.get(word, "")
            if not ipa:
                ipa = f"/{word}/"
            place_words.append({
                "word": word,
                "ipa": ipa,
                "category": category,
                "frequency": round(random.uniform(0.5, 1.0), 2),
                "can_prefix": category in ["quality", "direction", "proper_root", "sacred", "event"],
                "can_suffix": category in ["terrain", "structure", "flora", "fauna", "proper_root"],
            })

    # Add some GeoNames-derived place words (decompose long names for roots)
    seen_words = {w["word"] for w in place_words}
    for raw_name in geonames_list[:200]:
        # Simple heuristic: split on common separators and look for novel short roots
        parts = re.split(r"[\s\-\_']", raw_name.lower())
        for part in parts:
            part = part.strip()
            if 3 <= len(part) <= 12 and part.isalpha() and part not in seen_words:
                # Guess category from suffixes/prefixes
                cat = guess_category(part, lc)
                ipa = cmudict.get(part.capitalize(), f"/{part}/")
                place_words.append({
                    "word": part,
                    "ipa": ipa,
                    "category": cat,
                    "frequency": round(random.uniform(0.1, 0.5), 2),
                    "can_prefix": cat in ["quality", "direction", "proper_root"],
                    "can_suffix": cat in ["terrain", "structure", "flora", "fauna", "proper_root"],
                })
                seen_words.add(part)
                if len(place_words) >= 500:
                    break
        if len(place_words) >= 500:
            break

    # 3. Templates
    templates = DEFAULT_TEMPLATES.copy()
    # Add LC-specific templates if available
    if lc == "ja-jp":
        templates.extend([
            {"template": ["proper_root", "terrain"], "weight": 5, "separator": "", "example": "Fujiyama"},
            {"template": ["direction", "terrain"], "weight": 4, "separator": "", "example": "Kitayama"},
        ])
    elif lc == "en-gb":
        templates.extend([
            {"template": ["proper_root", "structure"], "weight": 5, "separator": "", "example": "Manchester"},
            {"template": ["terrain", "structure"], "weight": 2, "separator": "", "example": "Fordham"},
        ])
    elif lc == "zh-cn":
        templates.extend([
            {"template": ["direction", "terrain"], "weight": 5, "separator": "", "example": "Dongshan"},
            {"template": ["quality", "terrain"], "weight": 4, "separator": "", "example": "Changjiang"},
        ])

    # 4. Assemble LC JSON
    lc_json = {
        "lc_id": lc,
        "label": label,
        "language": language,
        "culture": culture,
        "script": "Latin" if lc not in ["zh-cn", "zh-tw", "ja-jp", "ko-kr", "ar-sa", "ar-eg", "hi-in"] else ("CJK" if lc.startswith("zh") or lc in ["ja-jp", "ko-kr"] else ("Arabic" if lc.startswith("ar") else "Devanagari")),
        "romanization": "native" if lc not in ["zh-cn", "zh-tw", "ja-jp", "ko-kr", "ar-sa", "ar-eg", "hi-in", "ru-ru"] else ("pinyin" if lc.startswith("zh") else ("hepburn" if lc == "ja-jp" else ("revised" if lc == "ko-kr" else "standard"))),
        "phonology_notes": f"Bootstrap phonology for {label}",
        "given_names": given_names,
        "family_names": family_names,
        "place_words": place_words,
        "place_templates": templates,
        "star_system_templates": STAR_SYSTEM_TEMPLATES,
    }

    return lc_json


def guess_category(word: str, lc: str) -> str:
    """Heuristic to guess place word category from word form."""
    # Common suffixes
    terrain_suffixes = ["ton", "ham", "ford", "wich", "port", "burg", "ville", "berg", "tal", "see", "mont", "val", "field", "wood", "moor", "dale", "glen", "yama", "gawa", "hara", "no"]
    structure_suffixes = ["castle", "fort", "tower", "bridge", "gate", "mill", "station", "church", "abbey", "hall"]
    direction_prefixes = ["north", "south", "east", "west", "upper", "lower", "new", "old", "kita", "minami", "higashi", "nishi"]
    quality_prefixes = ["green", "white", "black", "red", "blue", "great", "little", "grand", "old", "new"]

    w = word.lower()
    for suffix in structure_suffixes:
        if w.endswith(suffix):
            return "structure"
    for suffix in terrain_suffixes:
        if w.endswith(suffix):
            return "terrain"
    for prefix in direction_prefixes:
        if w.startswith(prefix):
            return "direction"
    for prefix in quality_prefixes:
        if w.startswith(prefix):
            return "quality"

    # Default: proper_root for short words, terrain for others
    return "proper_root" if len(w) <= 6 else "terrain"


def build_all():
    lc_defs = [
        ("en-us", "American English", "English", "American"),
        ("en-gb", "British English", "English", "British"),
        ("en-ie", "Irish English", "English", "Irish"),
        ("en-au", "Australian English", "English", "Australian"),
        ("en-ca", "Canadian English", "English", "Canadian"),
        ("ja-jp", "Japanese", "Japanese", "Japanese"),
        ("zh-cn", "Mandarin Chinese", "Mandarin", "Mainland Chinese"),
        ("es-es", "Castilian Spanish", "Spanish", "Castilian"),
        ("es-mx", "Mexican Spanish", "Spanish", "Mexican"),
        ("de-de", "German", "German", "German"),
        ("fr-fr", "French", "French", "French"),
        ("ar-sa", "Saudi Arabic", "Arabic", "Saudi"),
        ("ar-eg", "Egyptian Arabic", "Arabic", "Egyptian"),
        ("ko-kr", "Korean", "Korean", "Korean"),
        ("ru-ru", "Russian", "Russian", "Russian"),
        ("it-it", "Italian", "Italian", "Italian"),
        ("sv-se", "Swedish", "Swedish", "Swedish"),
        ("nl-nl", "Dutch", "Dutch", "Dutch"),
        ("pl-pl", "Polish", "Polish", "Polish"),
        ("hi-in", "Hindi", "Hindi", "Indian"),
        ("tl-ph", "Filipino", "Tagalog", "Filipino"),
        ("no-no", "Norwegian", "Norwegian", "Norwegian"),
        ("fi-fi", "Finnish", "Finnish", "Finnish"),
    ]

    lc_index = []
    for lc, label, language, culture in lc_defs:
        lc_json = build_lc_json(lc, label, language, culture)
        out_path = NAMEGEN_LC_DIR / f"{lc}.json"
        with open(out_path, "w", encoding="utf-8") as f:
            json.dump(lc_json, f, ensure_ascii=False, indent=2)
        print(f"  Wrote {out_path} ({len(lc_json['given_names'])} given, {len(lc_json['family_names'])} family, {len(lc_json['place_words'])} place words)")

        lc_index.append({
            "lc_id": lc,
            "label": label,
            "language": language,
            "culture": culture,
            "default_weight": 1.0,
        })

    # Write LC index
    with open(SHARED_DATA_DIR / "lc-index.json", "w", encoding="utf-8") as f:
        json.dump({"lcs": lc_index}, f, ensure_ascii=False, indent=2)

    # Write LC distance table (bootstrap: manual assignments)
    distances = []
    # Same language family = low, different = medium/high
    en_lcs = ["en-us", "en-gb", "en-ie", "en-au", "en-ca"]
    romance_lcs = ["es-es", "es-mx", "fr-fr", "it-it"]
    germanic_lcs = ["de-de", "nl-nl", "sv-se", "no-no", "fi-fi"]
    slavic_lcs = ["ru-ru", "pl-pl"]
    semitic_lcs = ["ar-sa", "ar-eg"]
    east_asian_lcs = ["ja-jp", "zh-cn", "ko-kr"]

    all_lcs = [lc for lc, _, _, _ in lc_defs]

    def get_distance(a, b):
        if a == b:
            return "same"
        groups = [en_lcs, romance_lcs, germanic_lcs, slavic_lcs, semitic_lcs, east_asian_lcs]
        for g in groups:
            if a in g and b in g:
                return "low"
        # Special cases
        if (a in en_lcs and b in germanic_lcs) or (a in germanic_lcs and b in en_lcs):
            return "low"
        if (a in romance_lcs and b in en_lcs) or (a in en_lcs and b in romance_lcs):
            return "medium"
        if (a in slavic_lcs and b in germanic_lcs) or (a in germanic_lcs and b in slavic_lcs):
            return "medium"
        return "high"

    for a in all_lcs:
        for b in all_lcs:
            if a <= b:  # Only store one direction
                distances.append({
                    "lc_a": a,
                    "lc_b": b,
                    "distance": get_distance(a, b),
                })

    with open(SHARED_DATA_DIR / "lc-distance.json", "w", encoding="utf-8") as f:
        json.dump({"distances": distances}, f, ensure_ascii=False, indent=2)

    print(f"\nDone. Built {len(lc_defs)} LC files.")


if __name__ == "__main__":
    import re
    random.seed(42)
    build_all()
