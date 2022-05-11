from components.rotor import Rotor
from config.config import Wiring

WIRING = Wiring("EKMFLGDQVZNTOWYHXUSPAIBRCJ")
NOTCH = "Q"


def test_rotor1_forward():
    r = Rotor(wiring=WIRING, notch=NOTCH)
    assert r.forward(0) == 4
    assert r.forward(25) == 9


def test_rotor1_rotate():
    r = Rotor(wiring=WIRING, notch=NOTCH)
    r.rotate()
    assert r.left[0] == "B"
    assert r.right[0] == "K"


def test_rotor1_rotate_to_B():
    r = Rotor(wiring=WIRING, notch=NOTCH)
    r.rotate_to_letter("G")
    assert r.left[0] == "G"
    assert r.right[0] == "D"

    assert r.left[25] == "F"
    assert r.right[25] == "G"
