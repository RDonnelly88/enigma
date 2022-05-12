from components.rotor import Rotor
from config.config import Wiring

WIRING = Wiring("EKMFLGDQVZNTOWYHXUSPAIBRCJ")
NOTCH = "Q"


def test_rotor_forward():
    r = Rotor(wiring=WIRING, notch=NOTCH, name="Test")
    assert r.forward(0) == 4  # A = E
    assert r.forward(25) == 9  # Z = J


def test_rotor_rotate():
    r = Rotor(wiring=WIRING, notch=NOTCH, name="Test")
    r.rotate()
    assert r.get_value_left(0) == "B"
    assert r.get_value_right(0) == "K"


def test_rotor_rotate_multiple_times():
    r = Rotor(wiring=WIRING, notch=NOTCH, name="Test")
    r.rotate(num_of_rotations=5)
    assert r.get_value_left(0) == "F"
    assert r.get_value_right(0) == "G"


def test_rotor_rotate_to_B():
    r = Rotor(wiring=WIRING, notch=NOTCH, name='Test')
    r.rotate_to_letter("G")  # Rotate rotor so first position on left is G
    assert r.get_value_left(0) == "G"
    assert r.get_value_right(0) == "D"

    assert r.get_value_left(25) == "F"  # Final value is now F
    assert r.get_value_right(25) == "G"


def test_set_ring():
    r = Rotor(wiring=WIRING, notch=NOTCH, name='Test')
    r.set_ring(1)
    assert r.get_value_left(0) == "Z"  # Rotated back once (A to Z)

    assert r.notch == "P"
