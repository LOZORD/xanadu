from base_player import BasePlayer

class Excavator(Base_Player):
  def __init__(self, **kwargs):
    super(Excavator, self).__init__(kwargs)
    self.inventory.extend(['pickaxe', 'dynamite', 'rope ladder',
      'additional torches'])
    self.repair_amount = 0.5
