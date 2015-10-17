from base_player import BasePlayer

class Prof(BasePlayer):
  def __init__(self, **kwargs):
    super(Prof, self).__init__(kwargs)
    self.inventory.extend(['matches', 'e-w translation book', 'ancient mongolian translation book'])
    self.can_identify_poison = True
    self.heal_amount = 0.5
    self.can_translate_modern = True
    self.can_translate_ancient = True
    self.can_fillet = True
