from player_stats import PlayerStats
class BasePlayer(object):
  WESTERN_ALLEGIANCE = 1
  EASTERN_ALLEGIANCE = 2
  def __init__(self, name, x, y, init_gold, modifiers, allegiance, abilities):
    self.uid = None # TODO
    self.name = name
    self.x = x
    self.y = y
    self.stats = PlayerStats()
    self.gold = init_gold
    self.inventory = []
    self.party = None
    self.modifiers = modifiers
    self.allegiance = allegiance
    # self.requires_translation = True
    # self.can_distinguish_poison = False

  def join_party(self, some_party):
    self.party = some_party

  def leave_party(self):
    self.party = None

  def swap_party(self, some_party):
    self.leave_party()
    self.join_party(some_party)

  def is_alive(self):
    return self.stats.health > 0

  def is_dead(self):
    return not self.is_alive()
