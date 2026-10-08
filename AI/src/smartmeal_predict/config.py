import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = os.getenv("MODEL_PATH", str(BASE_DIR / "models" / "best.onnx"))
if not os.path.exists(MODEL_PATH) and os.path.exists(str(BASE_DIR / "best.onnx")):
    MODEL_PATH = str(BASE_DIR / "best.onnx")

IMG_SIZE = int(os.getenv("IMG_SIZE", "512"))
CONF_THRESHOLD = float(os.getenv("CONF_THRESHOLD", "0.25"))
IOU_THRESHOLD = float(os.getenv("IOU_THRESHOLD", "0.45"))

CLASS_NAMES = [
    "Mushroom",
    "Egg",
    "Sweet Potato -Suthuni-",
    "Taro Leaves -Karkalo-",
    "Beetroot",
    "Potato",
    "Capsicum",
    "Taro Root-Pidalu-",
    "Turnip",
    "Green Mint -Pudina-",
    "Pointed Gourd -Chuche Karela-",
    "Stinging Nettle -Sisnu-",
    "Bitter Gourd",
    "Snake Gourd -Chichindo-",
    "Fiddlehead Ferns -Niguro-",
    "Palungo -Nepali Spinach-",
    "Cabbage",
    "Brinjal",
    "Bottle Gourd -Lauka-",
    "Tomato",
    "Onion",
    "Radish",
    "Sponge Gourd -Ghiraula-",
    "Red Lentils",
    "Masyaura",
    "Okra -Bhindi-",
    "Chayote-iskus-",
    "Garden Peas",
    "Cheese",
    "Rayo ko Saag",
    "Lapsi -Nepali Hog Plum-",
    "Artichoke",
    "Banana",
    "Cinnamon",
    "Bread",
    "Jack Fruit",
    "Beans",
    "Asparagus -Kurilo-",
    "Gundruk",
    "Avocado",
    "Nutrela -Soya Chunks-",
    "Rice -Chamal-",
    "Corn",
    "Onion Leaves",
    "Tree Tomato -Rukh Tamatar-",
    "Carrot",
    "Farsi ko Munta",
    "Coriander -Dhaniya-",
    "Lemon -Nimbu-",
    "Cassava -Ghar Tarul-",
    "Pork",
    "Cucumber",
    "Black Lentils",
    "Ash Gourd -Kubhindo-",
]
