from typing import Protocol


class Component(Protocol):

    def forward(self, letter: str) -> int:
        ...
    
    def backward(self, signal: int) -> str:
        ...