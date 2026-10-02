from components import historical_reflectors, historical_rotors
from components.keyboard import Keyboard
from components.plugboard import Plugboard
from config.config import ALPHABET, PlugboardPair, RotorKey, RotorRings
from enigma import Enigma

ROTORS = {
    "I": historical_rotors.rotor_1,
    "II": historical_rotors.rotor_2,
    "III": historical_rotors.rotor_3,
    "IV": historical_rotors.rotor_4,
    "V": historical_rotors.rotor_5,
}


def make_enigma(left, middle, right, key, rings=(0, 0, 0), pairs="", reflector=historical_reflectors.REFLECTOR_B):
    return Enigma(
        reflector=reflector,
        rotor1=ROTORS[left](),
        rotor2=ROTORS[middle](),
        rotor3=ROTORS[right](),
        plugboard=Plugboard([PlugboardPair(p[0], p[1]) for p in pairs.split()]),
        keyboard=Keyboard(),
        rotor_key=RotorKey(*key),
        rotor_rings=RotorRings(*rings),
    )


def encrypt(enigma, text):
    return "".join(enigma.encrypt(letter).cipher for letter in text)


def window(enigma):
    # The letter showing in each rotor's window is its position less its ring offset
    rings = (enigma.rotor_rings.a, enigma.rotor_rings.b, enigma.rotor_rings.c)
    rotors = (enigma.rotor1, enigma.rotor2, enigma.rotor3)
    return "".join(ALPHABET[(ALPHABET.find(r.get_value_left(0)) + ring) % 26] for r, ring in zip(rotors, rings))


def test_standard_check_value():
    assert encrypt(make_enigma("I", "II", "III", "AAA"), "AAAAA") == "BDZGO"


def test_ring_settings():
    assert encrypt(make_enigma("I", "II", "III", "AAA", rings=(1, 1, 1)), "AAAAA") == "EWTYX"


def test_middle_rotor_double_steps():
    enigma = make_enigma("I", "II", "III", "ADU")
    windows = []
    for _ in range(4):
        enigma.encrypt("A")
        windows.append(window(enigma))
    assert windows == ["ADV", "AEW", "BFX", "BFY"]


def test_double_step_respects_ring_settings():
    # Turnover follows the letter in the window, not the wiring underneath it
    enigma = make_enigma("I", "II", "III", "ADU", rings=(5, 9, 17))
    windows = []
    for _ in range(4):
        enigma.encrypt("A")
        windows.append(window(enigma))
    assert windows == ["ADV", "AEW", "BFX", "BFY"]


def test_operation_barbarossa_message():
    # First part of a message sent on 7 July 1941
    enigma = make_enigma(
        "II", "IV", "V", "BLA", rings=(1, 20, 11), pairs="AV BS CG DL FU HZ IN KM OW RX"
    )
    plaintext = encrypt(enigma, "EDPUDNRGYSZRCXNUYTPOMRMBOFKTBZREZKMLXLVEFGUEYSIOZVEQMIKUBPMMYLKLTTDEISMDICAGYKUACTCDOMOHWXMUUIAUBSTSLRNBZSZWNRFXWFYSSXJZVIJHIDISHPRKLKAYUPADTXQSPINQMATLPIFSVKDASCTACDPBOPVHJK")
    assert plaintext.startswith("AUFKLXABTEILUNGXVONXKURTINOWAXKURTINOWAXNORDWESTLXSEBEZXSEBEZXUAFFLIEGERSTRASZERIQTUNGXDUBROWKIXDUBROWKIXOPOTSCHKAXOPOTSCHKAXUMXEINSAQTDREINULLXUHRANGETRETENXANGRIFFXINFXRGTX")


def test_decrypting_returns_the_plaintext():
    plaintext = "WETTERVORHERSAGEBISKAYA"
    settings = ("IV", "I", "V", "QZM", (3, 14, 22), "AB CD EF GH")
    ciphertext = encrypt(make_enigma(*settings[:4], rings=settings[4], pairs=settings[5]), plaintext)
    assert encrypt(make_enigma(*settings[:4], rings=settings[4], pairs=settings[5]), ciphertext) == plaintext


def test_no_letter_encrypts_to_itself():
    enigma = make_enigma("III", "II", "I", "XYZ", pairs="AZ QW")
    for letter in ALPHABET * 20:
        assert enigma.encrypt(letter).cipher != letter


def test_two_machines_do_not_share_rotors():
    first = make_enigma("I", "II", "III", "AAA")
    expected = encrypt(make_enigma("I", "II", "III", "AAA"), "HELLO")
    make_enigma("I", "II", "III", "QRS", rings=(4, 4, 4))
    assert encrypt(first, "HELLO") == expected


def test_same_rotor_type_in_two_slots():
    a = make_enigma("I", "I", "II", "ABC")
    b = make_enigma("I", "I", "II", "ABC")
    ciphertext = encrypt(a, "SAMEROTORTWICE")
    assert encrypt(b, ciphertext) == "SAMEROTORTWICE"
