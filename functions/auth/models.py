from dataclasses import dataclass, field
from typing import Optional


@dataclass
class User:
    id: str
    """Unique identifier for the user. Probably their Discord ID"""

    role: str  # 'participant' | 'organizer'
    username: str

    # registration info (required for participant data structure)
    email: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phone: Optional[str] = None
    shirtSize: Optional[str] = None
    dietaryRestrictions: Optional[str] = None
    rfidUUID: Optional[str] = None

    # init event info
    teamId: Optional[str] = None  # this will be unset (undefined) until team assignment
    attendedEvents: list[str] = field(default_factory=list)
    isOrganizer: bool = False

    attrs: list[str] = field(default_factory=list)
    """Additional per-user attributes for future use."""
