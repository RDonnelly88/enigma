from components.keyboard import Keyboard
import pytest


def test_keyboard_forward():
    keyboard = Keyboard()
    assert keyboard.forward("A") == 0


def test_keyboard_backward():
    keyboard = Keyboard()
    assert keyboard.backward(0) == "A"


def test_keyboard_rejects_empty_and_non_letters():
    keyboard = Keyboard()
    for key in ("", "1", " ", "AB"):
        with pytest.raises(ValueError):
            keyboard.forward(key)
