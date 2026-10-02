from components.reflector import Reflector
from components.historical_reflectors import (
    REFLECTOR_A,
    REFLECTOR_B,
    REFLECTOR_C,
    REFLECTOR_B_THIN,
    REFLECTOR_C_THIN,
)
from config.config import Wiring
import pytest

WIRING = Wiring("EJMZALYXVBWFCRQUONTSPIKHGD")


def test_reflector_reflect():
    r = Reflector(wiring=WIRING, name='Test')
    assert r.reflect(0) == 4  # A is E
    assert r.reflect(25) == 3  # Z is D


def test_reflector_rejects_wiring_that_is_not_in_pairs():
    # The M4's Beta rotor: a valid rotor wiring, but A goes to L and L goes to B
    with pytest.raises(ValueError):
        Reflector(wiring=Wiring("LEYJVCNIXWPBQMDRTAKZGFUHOS"), name="Beta")


def test_historical_reflectors_are_reciprocal():
    for reflector in (REFLECTOR_A, REFLECTOR_B, REFLECTOR_C, REFLECTOR_B_THIN, REFLECTOR_C_THIN):
        for i in range(26):
            assert reflector.reflect(reflector.reflect(i)) == i
