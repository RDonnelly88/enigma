from components.plugboard import Plugboard
from config.config import ALPHABET, PlugboardPair
import pytest

pairs = [
    PlugboardPair("A", "R"),
    PlugboardPair("G", "K"),
    PlugboardPair("O", "X"),
]

plugboard = Plugboard(pairs)


def test_plugboard_pairs_right_alphabet_unchanged():
    assert plugboard.right == ALPHABET


def test_plugboard_pairs_left_alphabet():
    assert plugboard.left == "RBCDEFKHIJGLMNXPQASTUVWOYZ"


def test_plugboard_forward():
    assert plugboard.forward(0) == 17
    assert plugboard.forward(1) == 1


def test_plugboard_backward():
    assert plugboard.backward(17) == 0
    assert plugboard.backward(1) == 1


def test_plugboard_pairs_duplicate_value():
    with pytest.raises(ValueError):
        _ = Plugboard(
            [
                PlugboardPair("A", "R"),
                PlugboardPair("G", "J"),
                PlugboardPair("O", "A"),
            ]
        )


def test_plugboard_pair_must_be_a_letter():
    with pytest.raises(ValueError):
        PlugboardPair("A", "1")
