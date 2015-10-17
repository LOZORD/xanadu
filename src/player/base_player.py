from player_stats import PlayerStats
from abilities import Abilities
class BasePlayer(object, PlayerStats, Abilities):
  WESTERN_ALLEGIANCE = 1
  EASTERN_ALLEGIANCE = 2
  # def __init__(self, name, x, y, init_gold, modifiers, allegiance, abilities):
  def __init__(self, **kwargs):
    self.uid = None # TODO
    self.name = kwargs['name']
    self.x = kwargs['x']
    self.y = kwargs['y']
    self.gold = kwargs['init_gold']
    self.inventory = []
    self.party = None
    self.modifiers = kwargs['modifiers']
    self.allegiance = kwargs['allegiance']

  def join_party(self, some_party):
    self.party = some_party

  def leave_party(self):
    self.party = None

  def swap_party(self, some_party):
    self.leave_party()
    self.join_party(some_party)

  def is_alive(self):
    return self.health > 0

  def is_dead(self):
    return not self.is_alive()
