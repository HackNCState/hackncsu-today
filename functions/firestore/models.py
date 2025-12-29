from dataclasses import dataclass


@dataclass
class Team:
    name: str
    """This shall be unique"""
    memberIds: list[str]
    """Min 2 max 4 members"""
    track: str
    creatorId: str
    mentoringHelp: str
    """Do you need any mentoring on a specific subject?"""
