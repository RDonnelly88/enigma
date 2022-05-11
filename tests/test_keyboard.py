from components.keyboard import Keyboard

def test_keyboard_forward():
    keyboard = Keyboard()
    assert keyboard.forward('A') == 0

def test_keyboard_backward():
    keyboard = Keyboard()
    assert keyboard.backward(0) == 'A'
