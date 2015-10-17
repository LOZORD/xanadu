from base_player import BasePlayer

class Doctor(BasePlayer):
  def __init__(self, **kwargs):
    super(Doctor, self).__init__(kwargs)
    self.inventory.extend(['morphine', 'opium', 'medical kits',
      'poison antidote', 'e-w translation book', 'matches'])
    self.craftables.extend(['poison', 'poison antidote'])
    self.can_translate_modern = True
    self.can_fillet = True
