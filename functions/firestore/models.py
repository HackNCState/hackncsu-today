from dataclasses import dataclass
from typing import Literal


@dataclass
class Team:
    id: str
    name: str
    """This shall be unique"""
    memberIds: list[str]
    """Min 2 max 4 members"""
    track: str
    creatorId: str
    mentoringHelp: str
    """Do you need any mentoring on a specific subject?"""
    status: Literal["unverified", "approved", "rejected"]
    """The status of the team registration"""