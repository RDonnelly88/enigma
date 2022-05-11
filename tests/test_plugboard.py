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
    assert plugboard.right_alphabet == ALPHABET


def test_plugboard_pairs_left_alphabet():
    assert plugboard.left_alphabet == "RBCDEFKHIJGLMNXPQASTUVWOYZ"


def test_plugboard_forward():
    assert plugboard.forward(0) == 17
    assert plugboard.forward(1) == 1


def test_plugboard_backward():
    assert plugboard.forward(0) == 17
    assert plugboard.forward(1) == 1


def test_plugboard_pair_duplicate_value():
    with pytest.raises(ValueError):
        PlugboardPair("A", "A")


# def test_plugboard_duplicate_pairs():
#         with pytest.raises(ValueError):
#             plugboard = Plugboard([PlugboardPair('A', 'B'),
#                         PlugboardPair('B', 'C')])
