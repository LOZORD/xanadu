from base_player import BasePlayer

class Shaman(BasePlayer):
  def __init__(self, **kwargs):
    super(Shaman, self).__init__(kwargs)
    self.inventory.extend(['map to xanadu'])
    self.can_translate_ancient = True
    self.heal_amount = 0.5
    self.can_identify_poison = True
    self.craftables.extend(['poison'])
    self.addiction_probability = 0.75
