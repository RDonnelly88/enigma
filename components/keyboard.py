from config import ALPHABET

class Keyboard:

    def forward(self, letter: str) -> int:
        return ALPHABET.find(letter)
    
    def backward(self, signal: int) -> str:
        return ALPHABET[signal]
