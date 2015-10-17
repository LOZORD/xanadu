from base_player import BasePlayer

class Cartographer(BasePlayer):
  def __init__(self, **kwargs):
    super(Cartographer, self).__init__(kwargs)
    self.inventory.extend(['map to xanadu', 'additional torches', 'e-w translation book', 'ancient mongolian translation book'])
    self.line_of_sight = 2.0
    self.can_translate_modern = True
    self.can_setup_camp = True
    self.can_update_maps = True

