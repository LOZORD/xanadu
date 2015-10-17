from base_player import BasePlayer

class Caveman(BasePlayer):
  def __init__(self, **kwargs):
    super(Caveman, self).__init__(kwargs)
    self.inventory.extend(['knife', 'additional torches'])
    self.movement_speed = 2.0
    self.can_translate_ancient = True
    self.is_hunter = True
    self.line_of_sight_diff = 2.0
    self.addiction_probability = 0.75
